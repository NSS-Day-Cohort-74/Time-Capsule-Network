import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Flex, Text, Box, Heading, TextArea, Avatar, Badge, Separator } from "@radix-ui/themes";
import "./DiscussionThread.css";

export const DiscussionThread = () => {
    const { capsuleId } = useParams();
    const navigate = useNavigate();
    const [capsule, setCapsule] = useState(null);
    const [threads, setThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [newThreadTitle, setNewThreadTitle] = useState("");
    const [newThreadContent, setNewThreadContent] = useState("");
    const [newComment, setNewComment] = useState("");
    const [isCreatingThread, setIsCreatingThread] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch("http://localhost:8000/users/current", {
                    method: "GET",
                    headers: {
                        "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch current user');
                const userData = await response.json();
                setCurrentUser(userData);
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        fetchCurrentUser();
    }, []);

    // Fetch capsule and discussion threads
    useEffect(() => {
        const fetchCapsuleData = async () => {
            try {
                // Fetch capsule details
                const capsuleResponse = await fetch(`http://localhost:8000/capsules/${capsuleId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                    }
                });

                if (!capsuleResponse.ok) throw new Error('Failed to fetch capsule');
                const capsuleData = await capsuleResponse.json();
                setCapsule(capsuleData);

                // Fetch discussion threads for this capsule
                const threadsResponse = await fetch(`http://localhost:8000/discussionthreads?capsule=${capsuleId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                    }
                });

                if (!threadsResponse.ok) {
                    setThreads([]);
                    return;
                }

                const threadsData = await threadsResponse.json();
                setThreads(threadsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchCapsuleData();
    }, [capsuleId]);

    // Create a new discussion thread
    const createThread = async () => {
        if (!newThreadTitle || !newThreadContent) return;

        try {
            const response = await fetch(`http://localhost:8000/discussionthreads`, {
                method: "POST",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    capsule: parseInt(capsuleId),
                    title: newThreadTitle,
                    content: newThreadContent
                })
            });

            if (!response.ok) throw new Error('Failed to create thread');

            const newThreadData = await response.json();
            setThreads(prev => [...prev, newThreadData]);
            setNewThreadTitle("");
            setNewThreadContent("");
            setIsCreatingThread(false);
        } catch (error) {
            console.error("Error creating thread:", error);
        }
    };

    // Add a comment to a thread
    const addComment = async () => {
        if (!selectedThread || !newComment) return;

        try {
            const response = await fetch(`http://localhost:8000/discussioncomments`, {
                method: "POST",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    thread: selectedThread.id,
                    content: newComment
                })
            });

            if (!response.ok) throw new Error('Failed to add comment');

            const newCommentData = await response.json();

            // Update the selected thread with the new comment
            const updatedThread = {
                ...selectedThread,
                comments: [...selectedThread.comments, newCommentData]
            };

            // Update the threads list
            setThreads(prev =>
                prev.map(t => t.id === selectedThread.id ? updatedThread : t)
            );

            // Update the selected thread
            setSelectedThread(updatedThread);
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    // Handle thread selection
    const selectThread = async (threadId) => {
        try {
            const response = await fetch(`http://localhost:8000/discussionthreads/${threadId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch thread details');

            const threadData = await response.json();
            setSelectedThread(threadData);
        } catch (error) {
            console.error("Error fetching thread details:", error);
        }
    };

    if (!capsule) {
        return <div>Loading capsule data...</div>;
    }

    return (
        <div className="discussion-thread">
            <Flex direction="column" gap="4">
                <Heading size="6">{capsule.title} - Discussions</Heading>

                {selectedThread ? (
                    <Box className="thread-detail">
                        <Flex justify="between" align="center">
                            <Heading size="5">{selectedThread.title}</Heading>
                            <Button variant="soft" onClick={() => setSelectedThread(null)}>
                                Back to Threads
                            </Button>
                        </Flex>

                        <Card className="thread-content">
                            <Flex gap="2" align="start">
                                <Avatar
                                    size="2"
                                    fallback={selectedThread.author.username.substring(0, 2).toUpperCase()}
                                />
                                <Box>
                                    <Flex gap="2" align="baseline">
                                        <Text size="2" weight="bold">{selectedThread.author.username}</Text>
                                        <Text size="1" color="gray">
                                            {formatDate(selectedThread.created_at)}
                                        </Text>
                                    </Flex>
                                    <Text size="3" mt="1">{selectedThread.content}</Text>
                                </Box>
                            </Flex>
                        </Card>

                        <Separator my="3" size="4" />

                        <Box className="comments-section">
                            <Heading size="3" mb="2">Comments</Heading>

                            {selectedThread.comments?.length ? (
                                selectedThread.comments.map(comment => (
                                    <Card key={comment.id} className="comment-card">
                                        <Flex gap="2" align="start">
                                            <Avatar
                                                size="2"
                                                fallback={comment.author.username.substring(0, 2).toUpperCase()}
                                            />
                                            <Box>
                                                <Flex gap="2" align="baseline">
                                                    <Text size="2" weight="bold">{comment.author.username}</Text>
                                                    <Text size="1" color="gray">
                                                        {formatDate(comment.created_at)}
                                                    </Text>
                                                </Flex>
                                                <Text size="3">{comment.content}</Text>
                                            </Box>
                                        </Flex>
                                    </Card>
                                ))
                            ) : (
                                <Text size="2" color="gray">No comments yet. Be the first to comment!</Text>
                            )}
                        </Box>

                        <Flex direction="column" gap="2" mt="4">
                            <TextArea
                                placeholder="Add your comment..."
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                            />
                            <Button onClick={addComment}>Post Comment</Button>
                        </Flex>
                    </Box>
                ) : (
                    <>
                        <Flex justify="end">
                            <Button onClick={() => setIsCreatingThread(true)}>Create New Thread</Button>
                        </Flex>

                        {isCreatingThread && (
                            <Card className="new-thread-form">
                                <Heading size="3" mb="2">Create New Discussion Thread</Heading>

                                <Flex direction="column" gap="3">
                                    <label>
                                        Title:
                                        <input
                                            type="text"
                                            value={newThreadTitle}
                                            onChange={e => setNewThreadTitle(e.target.value)}
                                            className="text-input"
                                            placeholder="Thread title"
                                        />
                                    </label>

                                    <label>
                                        Content:
                                        <TextArea
                                            value={newThreadContent}
                                            onChange={e => setNewThreadContent(e.target.value)}
                                            placeholder="What would you like to discuss?"
                                        />
                                    </label>

                                    <Flex gap="2" justify="end">
                                        <Button variant="soft" color="gray" onClick={() => setIsCreatingThread(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={createThread}>Create Thread</Button>
                                    </Flex>
                                </Flex>
                            </Card>
                        )}

                        <div className="threads-list">
                            {threads.length === 0 ? (
                                <Text>No discussion threads yet. Create one to get started!</Text>
                            ) : (
                                threads.map(thread => (
                                    <Card
                                        key={thread.id}
                                        className="thread-card"
                                        onClick={() => selectThread(thread.id)}
                                    >
                                        <Flex justify="between" align="start">
                                            <Box>
                                                <Heading size="4">{thread.title}</Heading>
                                                <Flex gap="2" align="center" mt="1">
                                                    <Avatar
                                                        size="1"
                                                        fallback={thread.author.username.substring(0, 2).toUpperCase()}
                                                    />
                                                    <Text size="2">{thread.author.username}</Text>
                                                    <Text size="2" color="gray">
                                                        {formatDate(thread.created_at)}
                                                    </Text>
                                                </Flex>
                                            </Box>

                                            <Badge>
                                                {thread.comments?.length || 0} comments
                                            </Badge>
                                        </Flex>
                                    </Card>
                                ))
                            )}
                        </div>
                    </>
                )}
            </Flex>
        </div>
    );
};