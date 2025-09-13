import React, { useState, useEffect } from 'react';
import { ApiClient } from 'adminjs';
import { Box, H2, H3, H4, H5, Text, Button, Icon, Illustration } from '@adminjs/design-system';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const api = new ApiClient();

  useEffect(() => {
    api.getDashboard()
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching dashboard data:', error);
      });
  }, []);

  const stats = data?.stats || {};

  return (
    <Box data-css="dashboard">
      <Box 
        position="relative" 
        overflow="hidden" 
        backgroundColor="white" 
        padding={0}
      >
        {/* Header Section */}
        <Box 
          bg="primary100" 
          color="white" 
          p="xl" 
          pb="x3" 
          mb="xl" 
          borderRadius="lg"
          position="relative"
          overflow="hidden"
        >
          <Box position="absolute" right="-50px" top="-50px" opacity="0.1">
            <Illustration variant="Rocket" width={300} height={300} />
          </Box>
          <H2 fontWeight="bolder">Welcome to QuizServer Admin</H2>
          <Text opacity="0.8" mt="md">
            Manage your learning platform resources, users, courses, and quizzes from one place.
          </Text>
        </Box>

        {/* Stats Section */}
        <Box p="lg">
          <H3 mb="lg">Platform Statistics</H3>
          
          <Box flex flexDirection="row" flexWrap="wrap" mx="-md">
            <Box width={[1, 1/2, 1/2, 1/4]} p="md">
              <Box 
                className="stat-card primary"
                p="lg" 
                borderRadius="lg" 
                flex 
                flexDirection="column"
                bg="white"
                boxShadow="card"
              >
                <Box flex flexDirection="row" justifyContent="space-between" alignItems="center">
                  <H5 color="grey60">Students</H5>
                  <Box bg="primary100" p="sm" borderRadius="default">
                    <Icon icon="User" color="white" />
                  </Box>
                </Box>
                <Text fontSize="xl" fontWeight="bold" mt="md">{stats.studentsCount || 0}</Text>
                <Text mt="sm" fontSize="sm" color="grey40">Total registered students</Text>
              </Box>
            </Box>
            
            <Box width={[1, 1/2, 1/2, 1/4]} p="md">
              <Box 
                className="stat-card success"
                p="lg" 
                borderRadius="lg" 
                flex 
                flexDirection="column"
                bg="white"
                boxShadow="card"
              >
                <Box flex flexDirection="row" justifyContent="space-between" alignItems="center">
                  <H5 color="grey60">Courses</H5>
                  <Box bg="success100" p="sm" borderRadius="default">
                    <Icon icon="Book" color="white" />
                  </Box>
                </Box>
                <Text fontSize="xl" fontWeight="bold" mt="md">{stats.coursesCount || 0}</Text>
                <Text mt="sm" fontSize="sm" color="grey40">Available courses</Text>
              </Box>
            </Box>
            
            <Box width={[1, 1/2, 1/2, 1/4]} p="md">
              <Box 
                className="stat-card warning"
                p="lg" 
                borderRadius="lg" 
                flex 
                flexDirection="column"
                bg="white"
                boxShadow="card"
              >
                <Box flex flexDirection="row" justifyContent="space-between" alignItems="center">
                  <H5 color="grey60">Quizzes</H5>
                  <Box bg="warning100" p="sm" borderRadius="default">
                    <Icon icon="FileText" color="white" />
                  </Box>
                </Box>
                <Text fontSize="xl" fontWeight="bold" mt="md">{stats.quizzesCount || 0}</Text>
                <Text mt="sm" fontSize="sm" color="grey40">Created quizzes</Text>
              </Box>
            </Box>
            
            <Box width={[1, 1/2, 1/2, 1/4]} p="md">
              <Box 
                className="stat-card info"
                p="lg" 
                borderRadius="lg" 
                flex 
                flexDirection="column"
                bg="white"
                boxShadow="card"
              >
                <Box flex flexDirection="row" justifyContent="space-between" alignItems="center">
                  <H5 color="grey60">Submissions</H5>
                  <Box bg="info100" p="sm" borderRadius="default">
                    <Icon icon="CheckCircle" color="white" />
                  </Box>
                </Box>
                <Text fontSize="xl" fontWeight="bold" mt="md">{stats.submissionsCount || 0}</Text>
                <Text mt="sm" fontSize="sm" color="grey40">Quiz submissions</Text>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Quick Actions */}
        <Box p="lg" mt="xl">
          <H3 mb="lg">Quick Actions</H3>
          
          <Box flex flexDirection="row" flexWrap="wrap" mx="-md">
            <Box width={[1, 1/2, 1/3, 1/4]} p="md">
              <Box 
                as="a" 
                href="/admin/resources/Student"
                className="quick-link"
                p="lg" 
                borderRadius="lg" 
                bg="white" 
                flex 
                flexDirection="column"
                alignItems="center"
                textAlign="center"
                textDecoration="none"
                boxShadow="card"
              >
                <Box 
                  bg="primary100" 
                  p="lg" 
                  borderRadius="50%" 
                  mb="md"
                >
                  <Icon icon="User" color="white" size={24} />
                </Box>
                <H5 mb="sm">Manage Students</H5>
                <Text color="grey40" fontSize="sm">View, edit, and manage student accounts</Text>
              </Box>
            </Box>
            
            <Box width={[1, 1/2, 1/3, 1/4]} p="md">
              <Box 
                as="a" 
                href="/admin/resources/Course"
                className="quick-link"
                p="lg" 
                borderRadius="lg" 
                bg="white" 
                flex 
                flexDirection="column"
                alignItems="center"
                textAlign="center"
                textDecoration="none"
                boxShadow="card"
              >
                <Box 
                  bg="success100" 
                  p="lg" 
                  borderRadius="50%" 
                  mb="md"
                >
                  <Icon icon="Book" color="white" size={24} />
                </Box>
                <H5 mb="sm">Manage Courses</H5>
                <Text color="grey40" fontSize="sm">Create, edit, and organize courses</Text>
              </Box>
            </Box>
            
            <Box width={[1, 1/2, 1/3, 1/4]} p="md">
              <Box 
                as="a" 
                href="/admin/resources/Quiz"
                className="quick-link"
                p="lg" 
                borderRadius="lg" 
                bg="white" 
                flex 
                flexDirection="column"
                alignItems="center"
                textAlign="center"
                textDecoration="none"
                boxShadow="card"
              >
                <Box 
                  bg="warning100" 
                  p="lg" 
                  borderRadius="50%" 
                  mb="md"
                >
                  <Icon icon="FileText" color="white" size={24} />
                </Box>
                <H5 mb="sm">Manage Quizzes</H5>
                <Text color="grey40" fontSize="sm">Create and edit quizzes and questions</Text>
              </Box>
            </Box>
            
            <Box width={[1, 1/2, 1/3, 1/4]} p="md">
              <Box 
                as="a" 
                href="/admin/resources/QuizSubmission"
                className="quick-link"
                p="lg" 
                borderRadius="lg" 
                bg="white" 
                flex 
                flexDirection="column"
                alignItems="center"
                textAlign="center"
                textDecoration="none"
                boxShadow="card"
              >
                <Box 
                  bg="info100" 
                  p="lg" 
                  borderRadius="50%" 
                  mb="md"
                >
                  <Icon icon="CheckCircle" color="white" size={24} />
                </Box>
                <H5 mb="sm">View Submissions</H5>
                <Text color="grey40" fontSize="sm">Review student quiz submissions</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
