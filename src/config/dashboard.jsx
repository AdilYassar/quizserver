import React from 'react'
import { Box, H2, H3, Text } from '@adminjs/design-system'

const Dashboard = () => {
  return (
    <Box>
      <Box bg="primary100" color="white" p="xl" mb="xl" borderRadius="lg">
        <H2>🎯 QuizServer Admin Dashboard</H2>
        <Text mt="md">Welcome to your learning platform control center!</Text>
      </Box>

      <Box p="lg">
        <H3 mb="lg">📊 Platform Statistics</H3>
        
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" gridGap="lg">
          <Box bg="white" p="lg" borderRadius="lg" boxShadow="card">
            <H3 color="primary100">👥 Students</H3>
            <Text fontSize="2xl" fontWeight="bold">Loading...</Text>
            <Text fontSize="sm" color="grey40">Total registered students</Text>
          </Box>

          <Box bg="white" p="lg" borderRadius="lg" boxShadow="card">
            <H3 color="success100">📚 Courses</H3>
            <Text fontSize="2xl" fontWeight="bold">Loading...</Text>
            <Text fontSize="sm" color="grey40">Available courses</Text>
          </Box>

          <Box bg="white" p="lg" borderRadius="lg" boxShadow="card">
            <H3 color="warning100">📝 Quizzes</H3>
            <Text fontSize="2xl" fontWeight="bold">Loading...</Text>
            <Text fontSize="sm" color="grey40">Created quizzes</Text>
          </Box>

          <Box bg="white" p="lg" borderRadius="lg" boxShadow="card">
            <H3 color="info100">✅ Submissions</H3>
            <Text fontSize="2xl" fontWeight="bold">Loading...</Text>
            <Text fontSize="sm" color="grey40">Quiz submissions</Text>
          </Box>
        </Box>

        <Box mt="xl">
          <H3 mb="lg">🚀 Quick Actions</H3>
          <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gridGap="md">
            <Box as="a" href="/admin/resources/Student" 
                 bg="white" p="md" borderRadius="lg" boxShadow="card" 
                 textDecoration="none" textAlign="center">
              <Text fontWeight="bold" color="primary100">Manage Students</Text>
            </Box>
            <Box as="a" href="/admin/resources/Course" 
                 bg="white" p="md" borderRadius="lg" boxShadow="card" 
                 textDecoration="none" textAlign="center">
              <Text fontWeight="bold" color="success100">Manage Courses</Text>
            </Box>
            <Box as="a" href="/admin/resources/Quiz" 
                 bg="white" p="md" borderRadius="lg" boxShadow="card" 
                 textDecoration="none" textAlign="center">
              <Text fontWeight="bold" color="warning100">Manage Quizzes</Text>
            </Box>
            <Box as="a" href="/admin/resources/QuizSubmission" 
                 bg="white" p="md" borderRadius="lg" boxShadow="card" 
                 textDecoration="none" textAlign="center">
              <Text fontWeight="bold" color="info100">View Submissions</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Dashboard