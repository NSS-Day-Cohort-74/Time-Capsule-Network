import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Flex, Text, Box, Heading, Dialog, TextArea } from "@radix-ui/themes";
import "./StoryBrancher.css";

export const StoryBrancher = () => {
    const { capsuleId } = useParams();
    const navigate = useNavigate();
    const [story, setStory] = useState(null);
    const [currentNode, setCurrentNode] = useState(null);
    const [visitedNodes, setVisitedNodes] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newChoice, setNewChoice] = useState({ text: "", nextNodeContent: "" });

    // Fetch story data for this capsule
    useEffect(() => {
        const fetchStory = async () => {
            try {
                // Fetch story nodes for this capsule
                const response = await fetch(`http://localhost:8000/storynodes?capsule=${capsuleId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                    }
                });

                if (!response.ok) {
                    // If no story exists yet, create a default structure
                    const defaultStory = {
                        id: null,
                        capsule: parseInt(capsuleId),
                        title: "New Story",
                        rootNode: {
                            id: "root",
                            content: "Your story begins here...",
                            choices: []
                        },
                        nodes: {}
                    };
                    setStory(defaultStory);
                    setCurrentNode(defaultStory.rootNode);
                    return;
                }

                const data = await response.json();
                setStory(data);
                setCurrentNode(data.rootNode);
            } catch (error) {
                console.error("Error fetching story:", error);
            }
        };

        fetchStory();
    }, [capsuleId]);

    // Save story changes
    const saveStory = async () => {
        try {
            // First save the root node
            const rootNodeMethod = story.rootNode.id === "root" ? "POST" : "PUT";
            const rootNodeUrl = story.rootNode.id === "root"
                ? `http://localhost:8000/storynodes`
                : `http://localhost:8000/storynodes/${story.rootNode.id}`;

            const rootNodeResponse = await fetch(rootNodeUrl, {
                method: rootNodeMethod,
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    capsule: parseInt(capsuleId),
                    content: story.rootNode.content,
                    is_root: true
                })
            });

            if (!rootNodeResponse.ok) throw new Error('Failed to save root node');
            const savedRootNode = await rootNodeResponse.json();

            // Then save all other nodes
            for (const nodeId in story.nodes) {
                const node = story.nodes[nodeId];
                const nodeMethod = node.id.startsWith("node_") ? "POST" : "PUT";
                const nodeUrl = node.id.startsWith("node_")
                    ? `http://localhost:8000/storynodes`
                    : `http://localhost:8000/storynodes/${node.id}`;

                await fetch(nodeUrl, {
                    method: nodeMethod,
                    headers: {
                        "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        capsule: parseInt(capsuleId),
                        content: node.content,
                        is_root: false
                    })
                });
            }

            // Finally save all choices
            for (const nodeId in story.nodes) {
                const node = story.nodes[nodeId];
                for (const choice of node.choices) {
                    await fetch(`http://localhost:8000/storychoices`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            source_node: nodeId,
                            target_node: choice.nextNode,
                            text: choice.text
                        })
                    });
                }
            }
        } catch (error) {
            console.error("Error saving story:", error);
        }
    };

    // Handle choice selection
    const handleChoiceSelect = (choice) => {
        // Add current node to visited nodes
        setVisitedNodes(prev => [...prev, currentNode.id]);

        // Find the next node
        const nextNode = story.nodes[choice.nextNode] || null;
        setCurrentNode(nextNode);
    };

    // Add a new choice to the current node
    const addChoice = () => {
        if (!newChoice.text || !newChoice.nextNodeContent) return;

        // Create a new node ID
        const newNodeId = `node_${Date.now()}`;

        // Create the new node
        const newNode = {
            id: newNodeId,
            content: newChoice.nextNodeContent,
            choices: []
        };

        // Add the new node to the story
        const updatedStory = { ...story };
        updatedStory.nodes = { ...updatedStory.nodes, [newNodeId]: newNode };

        // Add the choice to the current node
        const updatedCurrentNode = { ...currentNode };
        updatedCurrentNode.choices = [
            ...updatedCurrentNode.choices,
            { text: newChoice.text, nextNode: newNodeId }
        ];

        // Update the current node in the story
        if (currentNode.id === "root") {
            updatedStory.rootNode = updatedCurrentNode;
        } else {
            updatedStory.nodes[currentNode.id] = updatedCurrentNode;
        }

        // Update state
        setStory(updatedStory);
        setCurrentNode(updatedCurrentNode);
        setNewChoice({ text: "", nextNodeContent: "" });
        setIsCreating(false);

        // Save changes
        saveStory();
    };

    // Go back to previous node
    const goBack = () => {
        if (visitedNodes.length === 0) return;

        // Get the last visited node
        const lastNodeId = visitedNodes[visitedNodes.length - 1];
        const lastNode = lastNodeId === "root" ? story.rootNode : story.nodes[lastNodeId];

        // Update state
        setCurrentNode(lastNode);
        setVisitedNodes(prev => prev.slice(0, -1));
    };

    // Render story visualization
    const renderStoryMap = () => {
        if (!story) return null;

        const renderNode = (node, level = 0, path = []) => {
            if (!node) return null;

            return (
                <div className="story-node" style={{ marginLeft: `${level * 20}px` }}>
                    <div className={`node-content ${currentNode?.id === node.id ? 'current-node' : ''}`}>
                        {node.content.substring(0, 30)}...
                    </div>
                    {node.choices.map((choice, index) => (
                        <div key={index} className="node-branch">
                            <div className="branch-line"></div>
                            <div className="choice-text">{choice.text}</div>
                            {renderNode(story.nodes[choice.nextNode], level + 1, [...path, node.id])}
                        </div>
                    ))}
                </div>
            );
        };

        return (
            <div className="story-map">
                <Heading size="4">Story Structure</Heading>
                <div className="story-tree">
                    {renderNode(story.rootNode)}
                </div>
            </div>
        );
    };

    if (!story || !currentNode) {
        return <div>Loading story...</div>;
    }

    return (
        <div className="story-brancher">
            <Flex direction="column" gap="4">
                <Heading size="6">{story.title || "Untitled Story"}</Heading>

                <Card className="story-content">
                    <Text size="5">{currentNode.content}</Text>
                </Card>

                {currentNode.choices.length > 0 && (
                    <Box className="story-choices">
                        <Heading size="3">What will you do?</Heading>
                        <Flex direction="column" gap="2" className="choice-buttons">
                            {currentNode.choices.map((choice, index) => (
                                <Button
                                    key={index}
                                    onClick={() => handleChoiceSelect(choice)}
                                    variant="soft"
                                    size="3"
                                >
                                    {choice.text}
                                </Button>
                            ))}
                        </Flex>
                    </Box>
                )}

                <Flex gap="3" justify="between">
                    <Button
                        onClick={goBack}
                        disabled={visitedNodes.length === 0}
                        variant="soft"
                    >
                        Go Back
                    </Button>

                    <Dialog.Root open={isCreating} onOpenChange={setIsCreating}>
                        <Dialog.Trigger>
                            <Button>Add Choice</Button>
                        </Dialog.Trigger>

                        <Dialog.Content>
                            <Dialog.Title>Add a New Choice</Dialog.Title>

                            <Flex direction="column" gap="3">
                                <label>
                                    Choice Text:
                                    <TextArea
                                        value={newChoice.text}
                                        onChange={e => setNewChoice({...newChoice, text: e.target.value})}
                                        placeholder="What option will the reader see?"
                                    />
                                </label>

                                <label>
                                    Next Node Content:
                                    <TextArea
                                        value={newChoice.nextNodeContent}
                                        onChange={e => setNewChoice({...newChoice, nextNodeContent: e.target.value})}
                                        placeholder="What happens when they choose this option?"
                                    />
                                </label>
                            </Flex>

                            <Flex gap="3" mt="4" justify="end">
                                <Dialog.Close>
                                    <Button variant="soft" color="gray">Cancel</Button>
                                </Dialog.Close>
                                <Button onClick={addChoice}>Add Choice</Button>
                            </Flex>
                        </Dialog.Content>
                    </Dialog.Root>
                </Flex>

                {renderStoryMap()}
            </Flex>
        </div>
    );
};