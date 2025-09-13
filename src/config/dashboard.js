// Simple dashboard component without JSX
import React from 'react';

const Dashboard = () => {
  return React.createElement('div', { style: { padding: '20px' } },
    React.createElement('div', { 
      style: { 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '20px',
        textAlign: 'center'
      }
    },
      React.createElement('h1', { style: { margin: '0 0 10px 0', fontSize: '2.5rem' } }, '🎯 QuizServer Admin Dashboard'),
      React.createElement('p', { style: { margin: '0', fontSize: '1.2rem', opacity: '0.9' } }, 'Welcome to your learning platform control center!')
    ),
    
    React.createElement('div', { style: { padding: '20px' } },
      React.createElement('h2', { style: { marginBottom: '20px', color: '#333' } }, '📊 Platform Statistics'),
      
      React.createElement('div', { 
        style: { 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }
      },
        React.createElement('div', { 
          style: { 
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }
        },
          React.createElement('h3', { style: { color: '#667eea', margin: '0 0 10px 0' } }, '👥 Students'),
          React.createElement('div', { style: { fontSize: '2rem', fontWeight: 'bold', color: '#667eea' } }, 'Loading...'),
          React.createElement('p', { style: { color: '#666', fontSize: '0.9rem', margin: '5px 0 0 0' } }, 'Total registered students')
        ),
        
        React.createElement('div', { 
          style: { 
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }
        },
          React.createElement('h3', { style: { color: '#28a745', margin: '0 0 10px 0' } }, '📚 Courses'),
          React.createElement('div', { style: { fontSize: '2rem', fontWeight: 'bold', color: '#28a745' } }, 'Loading...'),
          React.createElement('p', { style: { color: '#666', fontSize: '0.9rem', margin: '5px 0 0 0' } }, 'Available courses')
        ),
        
        React.createElement('div', { 
          style: { 
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }
        },
          React.createElement('h3', { style: { color: '#ffc107', margin: '0 0 10px 0' } }, '📝 Quizzes'),
          React.createElement('div', { style: { fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' } }, 'Loading...'),
          React.createElement('p', { style: { color: '#666', fontSize: '0.9rem', margin: '5px 0 0 0' } }, 'Created quizzes')
        ),
        
        React.createElement('div', { 
          style: { 
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }
        },
          React.createElement('h3', { style: { color: '#17a2b8', margin: '0 0 10px 0' } }, '✅ Submissions'),
          React.createElement('div', { style: { fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' } }, 'Loading...'),
          React.createElement('p', { style: { color: '#666', fontSize: '0.9rem', margin: '5px 0 0 0' } }, 'Quiz submissions')
        )
      ),
      
      React.createElement('div', null,
        React.createElement('h2', { style: { marginBottom: '20px', color: '#333' } }, '🚀 Quick Actions'),
        React.createElement('div', { 
          style: { 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px'
          }
        },
          React.createElement('a', { 
            href: '/admin/resources/Student',
            style: { 
              background: 'white',
              padding: '15px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#667eea',
              fontWeight: 'bold'
            }
          }, 'Manage Students'),
          
          React.createElement('a', { 
            href: '/admin/resources/Course',
            style: { 
              background: 'white',
              padding: '15px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#28a745',
              fontWeight: 'bold'
            }
          }, 'Manage Courses'),
          
          React.createElement('a', { 
            href: '/admin/resources/Quiz',
            style: { 
              background: 'white',
              padding: '15px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#ffc107',
              fontWeight: 'bold'
            }
          }, 'Manage Quizzes'),
          
          React.createElement('a', { 
            href: '/admin/resources/QuizSubmission',
            style: { 
              background: 'white',
              padding: '15px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              textAlign: 'center',
              color: '#17a2b8',
              fontWeight: 'bold'
            }
          }, 'View Submissions')
        )
      )
    )
  );
};

export default Dashboard;
