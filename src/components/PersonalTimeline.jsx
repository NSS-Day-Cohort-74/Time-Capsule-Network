import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Flex, Text, Box, Heading, Separator, Badge } from "@radix-ui/themes";
import "./PersonalTimeline.css";

export const PersonalTimeline = () => {
    const navigate = useNavigate();
    const [timeline, setTimeline] = useState([]);
    const [statistics, setStatistics] = useState({
        created: 0,
        discovered: 0,
        predictions: 0,
        discussions: 0
    });
    const [achievements, setAchievements] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [years, setYears] = useState([]);


    // Fetch timeline data
    useEffect(() => {
        const fetchTimelineData = async () => {

            try {
                // Fetch user's timeline
                const timelineResponse = await fetch(`http://localhost:8000/usertimeline`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                    }
                });

                if (!timelineResponse.ok) throw new Error('Failed to fetch timeline');
                const timelineData = await timelineResponse.json();

                // Process timeline data
                const processedTimeline = processTimelineData(timelineData);
                setTimeline(processedTimeline);

                // Extract years from timeline
                const timelineYears = [...new Set(processedTimeline.map(item => new Date(item.date).getFullYear()))];
                timelineYears.sort((a, b) => b - a); // Sort descending
                setYears(timelineYears);

                // Set default selected year to most recent if available
                if (timelineYears.length > 0) {
                    setSelectedYear(timelineYears[0]);
                }

                // Fetch statistics and achievements
                const statisticsResponse = await fetch(`http://localhost:8000/usertimeline/statistics`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Token ${JSON.parse(localStorage.getItem("capsule_token")).token}`
                    }
                });

                if (statisticsResponse.ok) {
                    const statisticsData = await statisticsResponse.json();

                    // Update statistics from API data
                    setStatistics({
                        created: statisticsData.total_created || 0,
                        discovered: 0, // Not provided in the API data
                        predictions: statisticsData.total_verified || 0,
                        discussions: statisticsData.total_discussions || 0,
                        comments: statisticsData.total_comments || 0,
                        statusStats: statisticsData.status_stats || {}
                    });

                    // Update achievements from API data
                    setAchievements(statisticsData.achievements || []);
                }
            } catch (error) {
                console.error("Error fetching timeline data:", error);
            }
        };

        fetchTimelineData();
    }, []);

    // Process timeline data
    const processTimelineData = (data) => {
        // Sort by date descending
        return data.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    // Calculate statistics from timeline data
    const calculateStatistics = (data) => {
        const stats = {
            created: 0,
            discovered: 0,
            predictions: 0,
            discussions: 0
        };

        data.forEach(item => {
            if (item.type === 'created') stats.created++;
            if (item.type === 'discovered') stats.discovered++;
            if (item.type === 'prediction') stats.predictions++;
            if (item.type === 'discussion') stats.discussions++;
        });

        return stats;
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Get timeline items for selected year
    const getTimelineItemsForYear = () => {
        return timeline.filter(item => new Date(item.date).getFullYear() === selectedYear);
    };

    // Get icon for timeline item type
    const getItemIcon = (type) => {
        switch (type) {
            case 'created':
                return '📝';
            case 'discovered':
                return '🔍';
            case 'prediction':
                return '🔮';
            case 'discussion':
                return '💬';
            default:
                return '📌';
        }
    };

    // Get color for timeline item type
    const getItemColor = (type) => {
        switch (type) {
            case 'created':
                return 'blue';
            case 'discovered':
                return 'green';
            case 'prediction':
                return 'purple';
            case 'discussion':
                return 'orange';
            default:
                return 'gray';
        }
    };

    // Get color for capsule status
    const getStatusColor = (status) => {
        switch (status) {
            case 'Draft':
                return 'gray';
            case 'Pending Review':
                return 'orange';
            case 'Published':
                return 'green';
            case 'Archived':
                return 'blue';
            case 'Deleted':
                return 'red';
            default:
                return 'gray';
        }
    };

    // Navigate to capsule
    const navigateToCapsule = (capsuleId) => {
        navigate(`/capsules/${capsuleId}`);
    };

    return (
        <div className="personal-timeline">
            <Flex direction="column" gap="4">
                <Heading size="6">Your Time Capsule Journey</Heading>

                <Card className="stats-card">
                    <Flex direction="column" gap="3">
                        <Flex gap="4" justify="between">
                            <Box className="stat-box">
                                <Text size="2" weight="bold">Created</Text>
                                <Text size="5">{statistics.created}</Text>
                            </Box>
                            <Box className="stat-box">
                                <Text size="2" weight="bold">Verified</Text>
                                <Text size="5">{statistics.predictions}</Text>
                            </Box>
                            <Box className="stat-box">
                                <Text size="2" weight="bold">Discussions</Text>
                                <Text size="5">{statistics.discussions}</Text>
                            </Box>
                            <Box className="stat-box">
                                <Text size="2" weight="bold">Comments</Text>
                                <Text size="5">{statistics.comments}</Text>
                            </Box>
                        </Flex>

                        {statistics.statusStats && Object.keys(statistics.statusStats).length > 0 && (
                            <>
                                <Separator size="2" />
                                <Box>
                                    <Text size="2" weight="bold" mb="2">Capsule Status</Text>
                                    <Flex gap="2" wrap="wrap">
                                        {Object.entries(statistics.statusStats).map(([status, count]) => (
                                            <Badge key={status} variant={count > 0 ? "solid" : "outline"} color={getStatusColor(status)}>
                                                {status}: {count}
                                            </Badge>
                                        ))}
                                    </Flex>
                                </Box>
                            </>
                        )}
                    </Flex>
                </Card>

                <Box className="achievements-section">
                    <Heading size="4">Achievements</Heading>

                    <Flex gap="2" wrap="wrap" className="achievements-list">
                        {achievements.length === 0 ? (
                            <Text size="2" color="gray">No achievements yet. Keep interacting with time capsules!</Text>
                        ) : (
                            achievements.map((achievement, index) => (
                                <Card key={index} className="achievement-card">
                                    <Text size="5" className="achievement-icon">🏆</Text>
                                    <Text size="3" weight="bold">{achievement.name}</Text>
                                    <Text size="2">{achievement.description}</Text>
                                    <Text size="1" color="gray">Earned: {formatDate(achievement.date_earned)}</Text>
                                </Card>
                            ))
                        )}
                    </Flex>
                </Box>

                <Separator size="4" />

                <Box className="timeline-section">
                    <Flex justify="between" align="center">
                        <Heading size="4">Timeline</Heading>

                        <Flex gap="2" align="center">
                            <Text size="2">Filter by year:</Text>
                            <select
                                value={selectedYear}
                                onChange={e => setSelectedYear(parseInt(e.target.value))}
                                className="year-select"
                            >
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </Flex>
                    </Flex>

                    <div className="timeline-container">
                        {getTimelineItemsForYear().length === 0 ? (
                            <Text size="2" color="gray">No activity in {selectedYear}</Text>
                        ) : (
                            getTimelineItemsForYear().map((item, index) => (
                                <div key={item.id} className="timeline-item">
                                    <div className="timeline-marker">
                                        <div className="timeline-date">
                                            <Text size="1">{formatDate(item.date)}</Text>
                                        </div>
                                        <div className={`timeline-icon icon-${getItemColor(item.type)}`}>
                                            {getItemIcon(item.type)}
                                        </div>
                                        <div className="timeline-line"></div>
                                    </div>

                                    <Card
                                        className="timeline-content"
                                        onClick={() => item.capsule_id && navigateToCapsule(item.capsule_id)}
                                    >
                                        <Flex gap="2" align="center">
                                            <Badge color={getItemColor(item.type)}>
                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                            </Badge>
                                            {item.capsule_title && (
                                                <Text size="2" weight="bold">
                                                    {item.capsule_title}
                                                </Text>
                                            )}
                                        </Flex>

                                        <Text size="3" mt="1">{item.description}</Text>

                                        {item.capsule_id && (
                                            <Text size="2" color="blue" className="view-link">
                                                View Capsule
                                            </Text>
                                        )}
                                    </Card>
                                </div>
                            ))
                        )}
                    </div>
                </Box>
            </Flex>
        </div>
    );
};