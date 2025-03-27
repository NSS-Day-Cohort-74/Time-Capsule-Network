import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Flex, Text, Box, Heading, Dialog, TextArea, Avatar, Badge } from "@radix-ui/themes";
import "./PredictionVerifier.css";

export const PredictionVerifier = () => {
    const { capsuleId } = useParams();
    const navigate = useNavigate();
    const [capsule, setCapsule] = useState(null);
    const [predictions, setPredictions] = useState([]);
    const [newPrediction, setNewPrediction] = useState({ text: "", dueDate: "" });
    const [isAddingPrediction, setIsAddingPrediction] = useState(false);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [newComment, setNewComment] = useState("");

    // Fetch capsule and its predictions
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

                // Fetch predictions for this capsule
                const predictionsResponse = await fetch(`http://localhost:8000/predictions?capsule=${capsuleId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                    }
                });

                if (!predictionsResponse.ok) {
                    setPredictions([]);
                    return;
                }

                const predictionsData = await predictionsResponse.json();
                setPredictions(predictionsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchCapsuleData();
    }, [capsuleId]);

    // Add a new prediction
    const addPrediction = async () => {
        if (!newPrediction.text || !newPrediction.dueDate) return;

        try {
            const response = await fetch(`http://localhost:8000/predictions`, {
                method: "POST",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    capsule: parseInt(capsuleId),
                    text: newPrediction.text,
                    due_date: newPrediction.dueDate,
                    status: "pending" // Default status
                })
            });

            if (!response.ok) throw new Error('Failed to add prediction');

            const newPredictionData = await response.json();
            setPredictions(prev => [...prev, newPredictionData]);
            setNewPrediction({ text: "", dueDate: "" });
            setIsAddingPrediction(false);
        } catch (error) {
            console.error("Error adding prediction:", error);
        }
    };

    // Vote on a prediction
    const votePrediction = async (predictionId, voteType) => {
        try {
            // First get the current prediction
            const getPredictionResponse = await fetch(`http://localhost:8000/predictions/${predictionId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                }
            });

            if (!getPredictionResponse.ok) throw new Error('Failed to get prediction');
            const prediction = await getPredictionResponse.json();

            // Update the vote count
            const updatedPrediction = { ...prediction };
            if (voteType === "correct") {
                updatedPrediction.correct_votes = (prediction.correct_votes || 0) + 1;
            } else {
                updatedPrediction.incorrect_votes = (prediction.incorrect_votes || 0) + 1;
            }

            // Update the prediction status if needed
            if (updatedPrediction.correct_votes > updatedPrediction.incorrect_votes) {
                updatedPrediction.status = "verified";
            }

            // Save the updated prediction
            const updateResponse = await fetch(`http://localhost:8000/predictions/${predictionId}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedPrediction)
            });

            if (!updateResponse.ok) throw new Error('Failed to update prediction');

            // Update the predictions list with the updated prediction
            const savedPrediction = await updateResponse.json();
            setPredictions(prev =>
                prev.map(p => p.id === predictionId ? savedPrediction : p)
            );
        } catch (error) {
            console.error("Error voting on prediction:", error);
        }
    };

    // Add a comment to a prediction
    const addComment = async () => {
        if (!selectedPrediction || !newComment) return;

        try {
            const response = await fetch(`http://localhost:8000/discussioncomments`, {
                method: "POST",
                headers: {
                    "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prediction: selectedPrediction.id,
                    content: newComment
                })
            });

            if (!response.ok) throw new Error('Failed to add comment');

            const newCommentData = await response.json();

            // Update the selected prediction with the new comment
            const updatedPrediction = {
                ...selectedPrediction,
                comments: [...selectedPrediction.comments, newCommentData]
            };

            // Update the predictions list
            setPredictions(prev =>
                prev.map(p => p.id === selectedPrediction.id ? updatedPrediction : p)
            );

            // Update the selected prediction
            setSelectedPrediction(updatedPrediction);
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    // Calculate prediction statistics
    const calculateStats = () => {
        if (!predictions.length) return { total: 0, verified: 0, pending: 0, accuracy: 0 };

        const total = predictions.length;
        const verified = predictions.filter(p => p.status === "verified").length;
        const pending = predictions.filter(p => p.status === "pending").length;
        const accuracy = verified > 0 ? (verified / total) * 100 : 0;

        return { total, verified, pending, accuracy: accuracy.toFixed(1) };
    };

    const stats = calculateStats();

    if (!capsule) {
        return <div>Loading capsule data...</div>;
    }

    return (
        <div className="prediction-verifier">
            <Flex direction="column" gap="4">
                <Heading size="6">{capsule.title} - Predictions</Heading>

                <Card className="stats-card">
                    <Flex gap="4" justify="between">
                        <Box>
                            <Text size="2" weight="bold">Total Predictions</Text>
                            <Text size="5">{stats.total}</Text>
                        </Box>
                        <Box>
                            <Text size="2" weight="bold">Verified</Text>
                            <Text size="5">{stats.verified}</Text>
                        </Box>
                        <Box>
                            <Text size="2" weight="bold">Pending</Text>
                            <Text size="5">{stats.pending}</Text>
                        </Box>
                        <Box>
                            <Text size="2" weight="bold">Accuracy</Text>
                            <Text size="5">{stats.accuracy}%</Text>
                        </Box>
                    </Flex>
                </Card>

                <Flex justify="end">
                    <Dialog.Root open={isAddingPrediction} onOpenChange={setIsAddingPrediction}>
                        <Dialog.Trigger>
                            <Button>Add Prediction</Button>
                        </Dialog.Trigger>

                        <Dialog.Content>
                            <Dialog.Title>Add a New Prediction</Dialog.Title>

                            <Flex direction="column" gap="3">
                                <label>
                                    Prediction:
                                    <TextArea
                                        value={newPrediction.text}
                                        onChange={e => setNewPrediction({...newPrediction, text: e.target.value})}
                                        placeholder="What do you predict will happen?"
                                    />
                                </label>

                                <label>
                                    Due Date:
                                    <input
                                        type="date"
                                        value={newPrediction.dueDate}
                                        onChange={e => setNewPrediction({...newPrediction, dueDate: e.target.value})}
                                        className="date-input"
                                    />
                                </label>
                            </Flex>

                            <Flex gap="3" mt="4" justify="end">
                                <Dialog.Close>
                                    <Button variant="soft" color="gray">Cancel</Button>
                                </Dialog.Close>
                                <Button onClick={addPrediction}>Add Prediction</Button>
                            </Flex>
                        </Dialog.Content>
                    </Dialog.Root>
                </Flex>

                <div className="predictions-list">
                    {predictions.length === 0 ? (
                        <Text>No predictions yet. Add one to get started!</Text>
                    ) : (
                        predictions.map(prediction => (
                            <Card key={prediction.id} className="prediction-card">
                                <Flex justify="between" align="start">
                                    <Box>
                                        <Flex gap="2" align="center">
                                            <Badge color={prediction.status === "verified" ? "green" : "orange"}>
                                                {prediction.status === "verified" ? "Verified" : "Pending"}
                                            </Badge>
                                            <Text size="2" color="gray">Due: {new Date(prediction.due_date).toLocaleDateString()}</Text>
                                        </Flex>
                                        <Text size="4" mt="2">{prediction.text}</Text>
                                    </Box>

                                    <Flex gap="2">
                                        <Button
                                            variant="soft"
                                            color="green"
                                            onClick={() => votePrediction(prediction.id, "correct")}
                                        >
                                            Correct ({prediction.correct_votes || 0})
                                        </Button>
                                        <Button
                                            variant="soft"
                                            color="red"
                                            onClick={() => votePrediction(prediction.id, "incorrect")}
                                        >
                                            Incorrect ({prediction.incorrect_votes || 0})
                                        </Button>
                                        <Button
                                            variant="soft"
                                            onClick={() => setSelectedPrediction(prediction)}
                                        >
                                            Discuss ({prediction.comments?.length || 0})
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Card>
                        ))
                    )}
                </div>

                {selectedPrediction && (
                    <Dialog.Root open={!!selectedPrediction} onOpenChange={(open) => !open && setSelectedPrediction(null)}>
                        <Dialog.Content>
                            <Dialog.Title>Discussion</Dialog.Title>

                            <Box className="prediction-detail">
                                <Text size="4" weight="bold">{selectedPrediction.text}</Text>
                                <Text size="2" color="gray">Due: {new Date(selectedPrediction.due_date).toLocaleDateString()}</Text>
                            </Box>

                            <Box className="comments-section">
                                <Heading size="3" mb="2">Comments</Heading>

                                {selectedPrediction.comments?.length ? (
                                    selectedPrediction.comments.map(comment => (
                                        <Card key={comment.id} className="comment-card">
                                            <Flex gap="2" align="start">
                                                <Avatar
                                                    size="2"
                                                    fallback={comment.user.username.substring(0, 2).toUpperCase()}
                                                />
                                                <Box>
                                                    <Flex gap="2" align="baseline">
                                                        <Text size="2" weight="bold">{comment.user.username}</Text>
                                                        <Text size="1" color="gray">
                                                            {new Date(comment.created_at).toLocaleString()}
                                                        </Text>
                                                    </Flex>
                                                    <Text size="3">{comment.text}</Text>
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
                        </Dialog.Content>
                    </Dialog.Root>
                )}
            </Flex>
        </div>
    );
};