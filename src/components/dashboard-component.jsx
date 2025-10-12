import React, { useState, useEffect } from 'react';
import { ApiClient } from 'adminjs';
import { Box, H2, H3, H4, H5, Text, Button, Icon, Illustration } from '@adminjs/design-system';

const Dashboard = (props) => {
  const { stats } = props;
  const [isLoading, setIsLoading] = useState(false);
  
  // You could fetch additional data here if needed
  // const api = new ApiClient();
  // useEffect(() => {
  //   api.getDashboard().then(response => {
  //     // Handle additional data
  //   })
  // }, []);

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
              >
                <Box flex flexDirection="row" justifyContent="space-between" alignItems="center">
                  <H5 color="grey60">Students</H5>
                  <Box bg="primary100" p="sm" borderRadius="default">
                    <Icon icon="User" color="white" />
                  </Box>
                </Box>
                <Text fontSize="xl" fontWeight="bold" mt="md">{stats?.studentsCount || 0}</Text>
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
              >
                <Box flex flexDirection="row" justifyContent="space-between" alignItems="center">
                  <H5 color="grey60">Courses</H5>
                  <Box bg="success100" p="sm" borderRadius="default">
                    <Icon icon="Book" color="white" />
                  </Box>
                </Box>
                <Text fontSize="xl" fontWeight="bold" mt="md">{stats?.coursesCount || 0}</Text>
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
              >
                <Box flex flexDirection="row" justifyContent="space-between" alignItems="center">
                  <H5 color="grey60">Quizzes</H5>
                  <Box bg="warning100" p="sm" borderRadius="default">
                    <Icon icon="FileText" color="white" />
                  </Box>
                </Box>
                <Text fontSize="xl" fontWeight="bold" mt="md">{stats?.quizzesCount || 0}</Text>
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
              >
                <Box flex flexDirection="row" justifyContent="space-between" alignItems="center">
                  <H5 color="grey60">Submissions</H5>
                  <Box bg="info100" p="sm" borderRadius="default">
                    <Icon icon="CheckCircle" color="white" />
                  </Box>
                </Box>
                <Text fontSize="xl" fontWeight="bold" mt="md">{stats?.submissionsCount || 0}</Text>
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
        
        {/* System Information */}
        <Box p="lg" mt="xl">
          <H3 mb="lg">System Information</H3>
          
          <Box 
            bg="grey5" 
            p="xl" 
            borderRadius="lg" 
            flex 
            flexDirection={['column', 'row']} 
            justifyContent="space-between"
          >
            <Box width={[1, 1/2]} mb={['lg', 0]}>
              <H4 mb="md">QuizServer Backend</H4>
              <Box mb="md">
                <Text fontWeight="bold" mb="sm">Server Status</Text>
                <Box flex alignItems="center">
                  <Box bg="success100" width="10px" height="10px" borderRadius="50%" mr="sm"></Box>
                  <Text>Online</Text>
                </Box>
              </Box>
              <Box mb="md">
                <Text fontWeight="bold" mb="sm">Version</Text>
                <Text>1.0.0</Text>
              </Box>
            </Box>
            
            <Box width={[1, 1/2]}>
              <H4 mb="md">Resources</H4>
              <Box as="ul" ml="lg">
                <Box as="li" mb="sm">
                  <Text as="a" href="/admin/resources/Student" color="primary100">Students Management</Text>
                </Box>
                <Box as="li" mb="sm">
                  <Text as="a" href="/admin/resources/Course" color="primary100">Course Management</Text>
                </Box>
                <Box as="li" mb="sm">
                  <Text as="a" href="/admin/resources/Quiz" color="primary100">Quiz Management</Text>
                </Box>
                <Box as="li" mb="sm">
                  <Text as="a" href="/admin/resources/QuizSubmission" color="primary100">Submission Management</Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
