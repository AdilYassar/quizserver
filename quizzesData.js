const quizzesData = [
  {
    "courseTitle": "Web Development",
    "quizzes": [
      {
        "title": "HTML & CSS Fundamentals",
        "description": "Test your knowledge of HTML structure and CSS styling basics",
        "difficulty": "easy",
        "level": "beginner",
        "duration": 25,
        "questions": [
          {
            "question": "What is the correct HTML element for the largest heading?",
            "type": "multiple-choice",
            "options": ["<heading>", "<h6>", "<h1>", "<head>"],
            "correctAnswer": "<h1>",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which CSS property controls the text size?",
            "type": "multiple-choice",
            "options": ["font-size", "text-size", "font-style", "text-style"],
            "correctAnswer": "font-size",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does CSS stand for?",
            "type": "multiple-choice",
            "options": ["Cascading Style Sheets", "Creative Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
            "correctAnswer": "Cascading Style Sheets",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which HTML attribute is used to define inline styles?",
            "type": "multiple-choice",
            "options": ["class", "style", "styles", "font"],
            "correctAnswer": "style",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "How do you make a list that lists items with bullets?",
            "type": "multiple-choice",
            "options": ["<ol>", "<ul>", "<dl>", "<list>"],
            "correctAnswer": "<ul>",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the correct CSS syntax for making all <p> elements bold?",
            "type": "multiple-choice",
            "options": ["p {font-weight:bold;}", "<p style='bold'>", "p {text-size:bold;}", "p {font:bold;}"],
            "correctAnswer": "p {font-weight:bold;}",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "Which property is used to change the background color in CSS?",
            "type": "multiple-choice",
            "options": ["bgcolor", "background-color", "color", "bg-color"],
            "correctAnswer": "background-color",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is semantic HTML?",
            "type": "short-answer",
            "correctAnswer": "HTML that uses tags that clearly describe their meaning and content to both browsers and developers",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "Which CSS box model property adds space outside an element's border?",
            "type": "multiple-choice",
            "options": ["padding", "margin", "border-spacing", "spacing"],
            "correctAnswer": "margin",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "How do you select an element with id 'header' in CSS?",
            "type": "multiple-choice",
            "options": [".header", "#header", "*header", "header"],
            "correctAnswer": "#header",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does the 'display: flex' property do in CSS?",
            "type": "multiple-choice",
            "options": ["Makes text flexible", "Creates a flexible layout container", "Hides elements", "Makes elements float"],
            "correctAnswer": "Creates a flexible layout container",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "Which HTML element is used for creating a table row?",
            "type": "multiple-choice",
            "options": ["<row>", "<tr>", "<td>", "<table-row>"],
            "correctAnswer": "<tr>",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the purpose of media queries in CSS?",
            "type": "multiple-choice",
            "options": ["To query databases", "To create responsive designs for different screen sizes", "To load media files", "To optimize images"],
            "correctAnswer": "To create responsive designs for different screen sizes",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "Which CSS property is used to create space between content and border?",
            "type": "multiple-choice",
            "options": ["margin", "padding", "spacing", "border-space"],
            "correctAnswer": "padding",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does the <meta> tag in HTML provide?",
            "type": "multiple-choice",
            "options": ["Metadata about the HTML document", "Main content", "Header information", "Footer information"],
            "correctAnswer": "Metadata about the HTML document",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "Which CSS position value removes an element from normal document flow?",
            "type": "multiple-choice",
            "options": ["static", "relative", "absolute", "fixed"],
            "correctAnswer": "absolute",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the purpose of the <form> element in HTML?",
            "type": "multiple-choice",
            "options": ["To format text", "To collect user input", "To create tables", "To define sections"],
            "correctAnswer": "To collect user input",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "True or False: CSS Grid and Flexbox can be used together in the same layout.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "Which CSS property controls the stacking order of positioned elements?",
            "type": "multiple-choice",
            "options": ["layer", "z-index", "stack-order", "position-order"],
            "correctAnswer": "z-index",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the viewport in responsive web design?",
            "type": "short-answer",
            "correctAnswer": "The visible area of a web page on a user's device screen",
            "difficulty": "medium",
            "points": 2
          }
        ]
      },
      {
        "title": "JavaScript & Frontend Frameworks",
        "description": "Advanced JavaScript concepts and frontend framework knowledge",
        "difficulty": "hard",
        "level": "advanced",
        "duration": 30,
        "questions": [
          {
            "question": "What is the virtual DOM in React?",
            "type": "multiple-choice",
            "options": ["A real DOM copy", "A lightweight representation of the real DOM", "A database", "A server-side DOM"],
            "correctAnswer": "A lightweight representation of the real DOM",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is closure in JavaScript?",
            "type": "multiple-choice",
            "options": ["A function that closes itself", "A function with access to variables from outer scope", "A closed loop", "A terminated function"],
            "correctAnswer": "A function with access to variables from outer scope",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What does JSX stand for in React?",
            "type": "multiple-choice",
            "options": ["JavaScript XML", "JavaScript Extension", "Java Syntax Extension", "JavaScript Execute"],
            "correctAnswer": "JavaScript XML",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the purpose of useEffect hook in React?",
            "type": "multiple-choice",
            "options": ["To manage state", "To perform side effects", "To create components", "To style components"],
            "correctAnswer": "To perform side effects",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is event bubbling in JavaScript?",
            "type": "short-answer",
            "correctAnswer": "Events propagate from the target element up through its ancestors in the DOM tree",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is the difference between let and var in JavaScript?",
            "type": "multiple-choice",
            "options": ["No difference", "let is block-scoped, var is function-scoped", "var is newer", "let cannot be reassigned"],
            "correctAnswer": "let is block-scoped, var is function-scoped",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is Redux used for?",
            "type": "multiple-choice",
            "options": ["Routing", "State management", "Styling", "API calls"],
            "correctAnswer": "State management",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the purpose of webpack in modern web development?",
            "type": "multiple-choice",
            "options": ["Module bundling", "Database management", "Server hosting", "CSS preprocessing"],
            "correctAnswer": "Module bundling",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a Promise in JavaScript?",
            "type": "multiple-choice",
            "options": ["A callback function", "An object representing eventual completion or failure of async operation", "A variable type", "A loop structure"],
            "correctAnswer": "An object representing eventual completion or failure of async operation",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What does async/await do in JavaScript?",
            "type": "multiple-choice",
            "options": ["Makes code run faster", "Provides cleaner syntax for handling promises", "Creates new threads", "Optimizes memory"],
            "correctAnswer": "Provides cleaner syntax for handling promises",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "True or False: Arrow functions have their own 'this' binding.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is the spread operator in JavaScript?",
            "type": "multiple-choice",
            "options": ["...", "***", "+++", ">>>"],
            "correctAnswer": "...",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is component lifecycle in React?",
            "type": "short-answer",
            "correctAnswer": "The series of methods invoked at different stages of a component's existence from mounting to unmounting",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is destructuring in JavaScript?",
            "type": "multiple-choice",
            "options": ["Breaking objects", "Extracting values from arrays or objects", "Deleting properties", "Creating objects"],
            "correctAnswer": "Extracting values from arrays or objects",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the purpose of keys in React lists?",
            "type": "multiple-choice",
            "options": ["For styling", "To help React identify which items have changed", "For navigation", "For data storage"],
            "correctAnswer": "To help React identify which items have changed",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is hoisting in JavaScript?",
            "type": "multiple-choice",
            "options": ["Moving variables to top", "Declaration hoisting to top of scope", "Raising exceptions", "Lifting elements"],
            "correctAnswer": "Declaration hoisting to top of scope",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is Context API in React?",
            "type": "multiple-choice",
            "options": ["A routing library", "A way to pass data through component tree without props drilling", "A styling solution", "A testing framework"],
            "correctAnswer": "A way to pass data through component tree without props drilling",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What does the map() function do in JavaScript?",
            "type": "multiple-choice",
            "options": ["Creates a new array with results of calling function on every element", "Sorts an array", "Filters an array", "Reduces an array"],
            "correctAnswer": "Creates a new array with results of calling function on every element",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is server-side rendering (SSR)?",
            "type": "multiple-choice",
            "options": ["Rendering on client", "Rendering HTML on server before sending to client", "Database rendering", "CSS rendering"],
            "correctAnswer": "Rendering HTML on server before sending to client",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "True or False: React is a full-fledged framework.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "Data Structures and Algorithms",
    "quizzes": [
      {
        "title": "Arrays and Strings Fundamentals",
        "description": "Basic operations and algorithms on arrays and strings",
        "difficulty": "easy",
        "level": "beginner",
        "duration": 20,
        "questions": [
          {
            "question": "What is the time complexity of accessing an element by index in an array?",
            "type": "multiple-choice",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
            "correctAnswer": "O(1)",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a string in programming?",
            "type": "multiple-choice",
            "options": ["A number sequence", "A sequence of characters", "A mathematical operation", "A data type for integers"],
            "correctAnswer": "A sequence of characters",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the space complexity of an array of size n?",
            "type": "multiple-choice",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
            "correctAnswer": "O(n)",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which operation is most efficient on an array?",
            "type": "multiple-choice",
            "options": ["Insertion at beginning", "Deletion at beginning", "Access by index", "Searching unsorted array"],
            "correctAnswer": "Access by index",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a two-dimensional array?",
            "type": "multiple-choice",
            "options": ["An array with two elements", "An array of arrays", "A sorted array", "A string array"],
            "correctAnswer": "An array of arrays",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the difference between an array and a linked list?",
            "type": "short-answer",
            "correctAnswer": "Arrays have contiguous memory and constant time access, linked lists have non-contiguous memory and linear time access",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is string concatenation?",
            "type": "multiple-choice",
            "options": ["Splitting strings", "Joining strings together", "Reversing strings", "Sorting strings"],
            "correctAnswer": "Joining strings together",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does it mean for an array to be sorted?",
            "type": "multiple-choice",
            "options": ["Elements are in random order", "Elements are in ascending or descending order", "Array has no duplicates", "Array is empty"],
            "correctAnswer": "Elements are in ascending or descending order",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the maximum number of elements an array of size 10 can hold?",
            "type": "multiple-choice",
            "options": ["9", "10", "11", "Unlimited"],
            "correctAnswer": "10",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "True or False: Arrays can store elements of different data types.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is an index in an array?",
            "type": "multiple-choice",
            "options": ["The size of array", "The position of an element", "The value of element", "The type of array"],
            "correctAnswer": "The position of an element",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the time complexity of linear search in an array?",
            "type": "multiple-choice",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
            "correctAnswer": "O(n)",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a substring?",
            "type": "multiple-choice",
            "options": ["A string containing only numbers", "A contiguous sequence of characters within a string", "A reversed string", "A sorted string"],
            "correctAnswer": "A contiguous sequence of characters within a string",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is array slicing?",
            "type": "multiple-choice",
            "options": ["Dividing array size", "Extracting a portion of an array", "Sorting an array", "Reversing an array"],
            "correctAnswer": "Extracting a portion of an array",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "True or False: String indices start at 1 in most programming languages.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does the length property/method return for an array?",
            "type": "multiple-choice",
            "options": ["First element", "Last element", "Number of elements", "Memory size"],
            "correctAnswer": "Number of elements",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a palindrome string?",
            "type": "multiple-choice",
            "options": ["A string with no vowels", "A string that reads same forwards and backwards", "A string with only numbers", "A sorted string"],
            "correctAnswer": "A string that reads same forwards and backwards",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the result of reversing an empty array?",
            "type": "multiple-choice",
            "options": ["Null", "Empty array", "Error", "Array with one element"],
            "correctAnswer": "Empty array",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is string immutability?",
            "type": "short-answer",
            "correctAnswer": "Once a string is created, its content cannot be changed; modifications create new strings",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is the difference between shallow copy and deep copy of an array?",
            "type": "multiple-choice",
            "options": ["No difference", "Shallow copy references, deep copy duplicates all nested objects", "Shallow is faster", "Deep is smaller"],
            "correctAnswer": "Shallow copy references, deep copy duplicates all nested objects",
            "difficulty": "medium",
            "points": 1
          }
        ]
      },
      {
        "title": "Trees and Graphs Advanced",
        "description": "Advanced concepts in tree and graph data structures",
        "difficulty": "hard",
        "level": "advanced",
        "duration": 35,
        "questions": [
          {
            "question": "What is a binary search tree (BST)?",
            "type": "multiple-choice",
            "options": ["A tree with two children", "A tree where left child is smaller and right is larger", "A balanced tree", "A tree with binary values"],
            "correctAnswer": "A tree where left child is smaller and right is larger",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the time complexity of searching in a balanced BST?",
            "type": "multiple-choice",
            "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
            "correctAnswer": "O(log n)",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a graph cycle?",
            "type": "multiple-choice",
            "options": ["A path that visits all nodes", "A path that starts and ends at the same node", "A disconnected component", "A tree structure"],
            "correctAnswer": "A path that starts and ends at the same node",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the difference between DFS and BFS?",
            "type": "short-answer",
            "correctAnswer": "DFS explores deep into branches using stack, BFS explores level by level using queue",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is a trie data structure used for?",
            "type": "multiple-choice",
            "options": ["Sorting numbers", "Efficient string searching and prefix matching", "Graph traversal", "Mathematical operations"],
            "correctAnswer": "Efficient string searching and prefix matching",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is the height of a balanced binary tree with n nodes?",
            "type": "multiple-choice",
            "options": ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
            "correctAnswer": "O(log n)",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is an AVL tree?",
            "type": "multiple-choice",
            "options": ["A type of graph", "A self-balancing binary search tree", "A sorting algorithm", "A hash table"],
            "correctAnswer": "A self-balancing binary search tree",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What does inorder traversal of a BST produce?",
            "type": "multiple-choice",
            "options": ["Random order", "Sorted order", "Reverse order", "Level order"],
            "correctAnswer": "Sorted order",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is topological sorting used for?",
            "type": "multiple-choice",
            "options": ["Sorting arrays", "Ordering vertices in a directed acyclic graph", "Finding shortest path", "Tree balancing"],
            "correctAnswer": "Ordering vertices in a directed acyclic graph",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is Dijkstra's algorithm used for?",
            "type": "multiple-choice",
            "options": ["Sorting", "Finding shortest path in weighted graph", "Tree traversal", "String matching"],
            "correctAnswer": "Finding shortest path in weighted graph",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "True or False: All trees are graphs, but not all graphs are trees.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a minimum spanning tree?",
            "type": "multiple-choice",
            "options": ["Smallest tree possible", "Tree connecting all vertices with minimum total edge weight", "Shortest path tree", "Balanced tree"],
            "correctAnswer": "Tree connecting all vertices with minimum total edge weight",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is the space complexity of adjacency matrix representation?",
            "type": "multiple-choice",
            "options": ["O(V)", "O(E)", "O(V^2)", "O(V+E)"],
            "correctAnswer": "O(V^2)",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a red-black tree?",
            "type": "short-answer",
            "correctAnswer": "A self-balancing binary search tree with color properties ensuring balanced height",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is the purpose of a heap data structure?",
            "type": "multiple-choice",
            "options": ["String operations", "Efficient priority queue operations", "Graph traversal", "Sorting strings"],
            "correctAnswer": "Efficient priority queue operations",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a bipartite graph?",
            "type": "multiple-choice",
            "options": ["Graph with two nodes", "Graph whose vertices can be divided into two independent sets", "Graph with two edges", "Binary tree"],
            "correctAnswer": "Graph whose vertices can be divided into two independent sets",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is the time complexity of Prim's algorithm?",
            "type": "multiple-choice",
            "options": ["O(V)", "O(E)", "O(E log V)", "O(V^2)"],
            "correctAnswer": "O(E log V)",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a strongly connected component in a directed graph?",
            "type": "multiple-choice",
            "options": ["A cycle", "A maximal subgraph where every vertex is reachable from every other", "A tree", "A path"],
            "correctAnswer": "A maximal subgraph where every vertex is reachable from every other",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is the difference between preorder and postorder traversal?",
            "type": "short-answer",
            "correctAnswer": "Preorder visits root before children, postorder visits root after children",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "True or False: A binary heap can be efficiently implemented using an array.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "Machine Learning",
    "quizzes": [
      {
        "title": "Supervised Learning Fundamentals",
        "description": "Core concepts of supervised learning algorithms",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What is supervised learning?",
            "type": "multiple-choice",
            "options": ["Learning without labels", "Learning with labeled training data", "Reinforcement learning", "Unsupervised clustering"],
            "correctAnswer": "Learning with labeled training data",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the difference between classification and regression?",
            "type": "short-answer",
            "correctAnswer": "Classification predicts discrete categories, regression predicts continuous values",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is linear regression used for?",
            "type": "multiple-choice",
            "options": ["Classification", "Predicting continuous values", "Clustering", "Dimensionality reduction"],
            "correctAnswer": "Predicting continuous values",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is logistic regression used for?",
            "type": "multiple-choice",
            "options": ["Regression problems", "Binary classification", "Clustering", "Feature selection"],
            "correctAnswer": "Binary classification",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is overfitting in machine learning?",
            "type": "multiple-choice",
            "options": ["Model too simple", "Model learns training data too well including noise", "Model converges slowly", "Model has few features"],
            "correctAnswer": "Model learns training data too well including noise",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the purpose of a training set?",
            "type": "multiple-choice",
            "options": ["To test model", "To train model parameters", "To validate model", "To deploy model"],
            "correctAnswer": "To train model parameters",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is cross-validation?",
            "type": "multiple-choice",
            "options": ["Validating data", "Technique to assess model performance on unseen data", "Cross-checking features", "Comparing models"],
            "correctAnswer": "Technique to assess model performance on unseen data",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a decision tree?",
            "type": "multiple-choice",
            "options": ["A flowchart-like structure for making decisions", "A neural network", "A clustering algorithm", "A dimensionality reduction technique"],
            "correctAnswer": "A flowchart-like structure for making decisions",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is regularization in machine learning?",
            "type": "multiple-choice",
            "options": ["Making data regular", "Technique to prevent overfitting by adding penalty term", "Data preprocessing", "Feature scaling"],
            "correctAnswer": "Technique to prevent overfitting by adding penalty term",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a random forest?",
            "type": "multiple-choice",
            "options": ["A single decision tree", "An ensemble of decision trees", "A clustering method", "A neural network"],
            "correctAnswer": "An ensemble of decision trees",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: Higher training accuracy always means better model.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the bias-variance tradeoff?",
            "type": "short-answer",
            "correctAnswer": "The balance between model simplicity (high bias) and complexity (high variance) to minimize total error",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is a support vector machine (SVM)?",
            "type": "multiple-choice",
            "options": ["A clustering algorithm", "A classifier that finds optimal hyperplane separating classes", "A regression method", "A dimensionality reduction technique"],
            "correctAnswer": "A classifier that finds optimal hyperplane separating classes",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is gradient descent?",
            "type": "multiple-choice",
            "options": ["A classification algorithm", "An optimization algorithm to minimize loss function", "A clustering method", "A feature selection technique"],
            "correctAnswer": "An optimization algorithm to minimize loss function",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is the confusion matrix?",
            "type": "multiple-choice",
            "options": ["A matrix of confused data", "A table showing true vs predicted classifications", "A correlation matrix", "A weight matrix"],
            "correctAnswer": "A table showing true vs predicted classifications",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is precision in classification?",
            "type": "multiple-choice",
            "options": ["Total correct predictions", "True positives divided by all predicted positives", "True positives divided by all actual positives", "Accuracy score"],
            "correctAnswer": "True positives divided by all predicted positives",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is recall in classification?",
            "type": "multiple-choice",
            "options": ["Total correct predictions", "True positives divided by all predicted positives", "True positives divided by all actual positives", "False positive rate"],
            "correctAnswer": "True positives divided by all actual positives",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is feature engineering?",
            "type": "multiple-choice",
            "options": ["Building models", "Creating or selecting features to improve model performance", "Testing features", "Removing features"],
            "correctAnswer": "Creating or selecting features to improve model performance",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: More features always lead to better model performance.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the purpose of a validation set?",
            "type": "multiple-choice",
            "options": ["To train model", "To tune hyperparameters and validate model", "To test final model", "To preprocess data"],
            "correctAnswer": "To tune hyperparameters and validate model",
            "difficulty": "medium",
            "points": 1
          }
        ]
      },
      {
        "title": "Deep Learning and Neural Networks",
        "description": "Advanced concepts in neural networks and deep learning",
        "difficulty": "hard",
        "level": "advanced",
        "duration": 35,
        "questions": [
          {
            "question": "What is a neural network?",
            "type": "multiple-choice",
            "options": ["A biological network", "A computational model inspired by biological neurons", "A decision tree", "A linear model"],
            "correctAnswer": "A computational model inspired by biological neurons",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is an activation function?",
            "type": "multiple-choice",
            "options": ["A function to activate neurons", "A non-linear function applied to neuron outputs", "A loss function", "An optimization function"],
            "correctAnswer": "A non-linear function applied to neuron outputs",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What does CNN stand for?",
            "type": "multiple-choice",
            "options": ["Central Neural Network", "Convolutional Neural Network", "Computational Neural Network", "Connected Neural Network"],
            "correctAnswer": "Convolutional Neural Network",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What are CNNs primarily used for?",
            "type": "multiple-choice",
            "options": ["Text processing", "Image recognition and computer vision", "Time series analysis", "Tabular data"],
            "correctAnswer": "Image recognition and computer vision",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is backpropagation?",
            "type": "short-answer",
            "correctAnswer": "Algorithm for calculating gradients of loss with respect to weights by propagating errors backward through network",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is the vanishing gradient problem?",
            "type": "multiple-choice",
            "options": ["Gradients become too large", "Gradients become very small in deep networks hindering learning", "Loss doesn't decrease", "Model overfits"],
            "correctAnswer": "Gradients become very small in deep networks hindering learning",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is ReLU activation function?",
            "type": "multiple-choice",
            "options": ["Sigmoid function", "Returns maximum of 0 and input", "Softmax function", "Tanh function"],
            "correctAnswer": "Returns maximum of 0 and input",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is dropout in neural networks?",
            "type": "multiple-choice",
            "options": ["Removing layers", "Randomly dropping neurons during training to prevent overfitting", "Stopping training early", "Reducing learning rate"],
            "correctAnswer": "Randomly dropping neurons during training to prevent overfitting",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is batch normalization?",
            "type": "multiple-choice",
            "options": ["Normalizing input data", "Normalizing activations within network layers", "Normalizing weights", "Normalizing loss"],
            "correctAnswer": "Normalizing activations within network layers",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is transfer learning?",
            "type": "multiple-choice",
            "options": ["Transferring data", "Using pre-trained models for new but related tasks", "Moving models between servers", "Transferring weights"],
            "correctAnswer": "Using pre-trained models for new but related tasks",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What does RNN stand for?",
            "type": "multiple-choice",
            "options": ["Random Neural Network", "Recurrent Neural Network", "Recursive Neural Network", "Regularized Neural Network"],
            "correctAnswer": "Recurrent Neural Network",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What are RNNs designed for?",
            "type": "multiple-choice",
            "options": ["Image processing", "Sequential data like text and time series", "Tabular data", "Static data"],
            "correctAnswer": "Sequential data like text and time series",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is an autoencoder?",
            "type": "multiple-choice",
            "options": ["A compression algorithm", "A neural network for unsupervised learning and dimensionality reduction", "A classification model", "A regression model"],
            "correctAnswer": "A neural network for unsupervised learning and dimensionality reduction",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is the purpose of pooling layers in CNNs?",
            "type": "multiple-choice",
            "options": ["To increase dimensions", "To reduce spatial dimensions and computation", "To add non-linearity", "To normalize data"],
            "correctAnswer": "To reduce spatial dimensions and computation",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "True or False: LSTM networks are a type of RNN designed to handle long-term dependencies.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the softmax function used for?",
            "type": "multiple-choice",
            "options": ["Binary classification", "Multi-class classification output probabilities", "Regression", "Feature scaling"],
            "correctAnswer": "Multi-class classification output probabilities",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a GAN?",
            "type": "multiple-choice",
            "options": ["Gradient Activation Network", "Generative Adversarial Network", "General Artificial Network", "Grouped Attention Network"],
            "correctAnswer": "Generative Adversarial Network",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is the purpose of the learning rate in training neural networks?",
            "type": "short-answer",
            "correctAnswer": "Controls the step size of weight updates during gradient descent optimization",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is epoch in neural network training?",
            "type": "multiple-choice",
            "options": ["One forward pass", "One complete pass through entire training dataset", "One batch", "One iteration"],
            "correctAnswer": "One complete pass through entire training dataset",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: Deeper neural networks always perform better than shallow ones.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "Cybersecurity",
    "quizzes": [
      {
        "title": "Network Security and Cryptography",
        "description": "Fundamentals of network security and encryption",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What is encryption?",
            "type": "multiple-choice",
            "options": ["Compressing data", "Converting data into coded form to prevent unauthorized access", "Deleting data", "Backing up data"],
            "correctAnswer": "Converting data into coded form to prevent unauthorized access",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the difference between symmetric and asymmetric encryption?",
            "type": "short-answer",
            "correctAnswer": "Symmetric uses same key for encryption and decryption, asymmetric uses public and private key pairs",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is a firewall?",
            "type": "multiple-choice",
            "options": ["A physical wall", "A network security device that monitors and filters traffic", "An antivirus program", "A backup system"],
            "correctAnswer": "A network security device that monitors and filters traffic",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does SSL/TLS provide?",
            "type": "multiple-choice",
            "options": ["Data compression", "Secure encrypted communication over networks", "Fast data transfer", "Data storage"],
            "correctAnswer": "Secure encrypted communication over networks",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a VPN?",
            "type": "multiple-choice",
            "options": ["Virtual Private Network for secure connections", "Very Private Network", "Virus Protection Network", "Visual Private Network"],
            "correctAnswer": "Virtual Private Network for secure connections",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a man-in-the-middle attack?",
            "type": "multiple-choice",
            "options": ["A physical attack", "An attack where attacker intercepts communication between two parties", "A denial of service attack", "A password attack"],
            "correctAnswer": "An attack where attacker intercepts communication between two parties",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is hashing used for in security?",
            "type": "multiple-choice",
            "options": ["Encrypting data", "Creating fixed-size fingerprints of data for integrity verification", "Compressing data", "Storing passwords in plain text"],
            "correctAnswer": "Creating fixed-size fingerprints of data for integrity verification",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a digital certificate?",
            "type": "multiple-choice",
            "options": ["A digital diploma", "An electronic document that proves ownership of public key", "A password", "A firewall rule"],
            "correctAnswer": "An electronic document that proves ownership of public key",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is PKI?",
            "type": "multiple-choice",
            "options": ["Private Key Infrastructure", "Public Key Infrastructure", "Protected Key Infrastructure", "Primary Key Infrastructure"],
            "correctAnswer": "Public Key Infrastructure",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is port scanning?",
            "type": "multiple-choice",
            "options": ["Scanning documents", "Probing network to discover open ports and services", "Checking for viruses", "Backing up data"],
            "correctAnswer": "Probing network to discover open ports and services",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: HTTPS uses port 443 by default.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a brute force attack?",
            "type": "multiple-choice",
            "options": ["Physical attack", "Trying all possible combinations to crack password", "Network flooding", "Malware injection"],
            "correctAnswer": "Trying all possible combinations to crack password",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is two-factor authentication?",
            "type": "multiple-choice",
            "options": ["Using two passwords", "Using two different verification methods to authenticate", "Two login attempts", "Two users"],
            "correctAnswer": "Using two different verification methods to authenticate",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a rainbow table attack?",
            "type": "multiple-choice",
            "options": ["Colorful attack", "Using precomputed hash values to crack passwords", "Network flooding", "Social engineering"],
            "correctAnswer": "Using precomputed hash values to crack passwords",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is salting in password security?",
            "type": "short-answer",
            "correctAnswer": "Adding random data to passwords before hashing to prevent rainbow table attacks",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is the purpose of an IDS?",
            "type": "multiple-choice",
            "options": ["Intrusion Detection System to monitor for malicious activity", "Internet Data System", "Internal Defense System", "Integrated Defense System"],
            "correctAnswer": "Intrusion Detection System to monitor for malicious activity",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the difference between IDS and IPS?",
            "type": "multiple-choice",
            "options": ["No difference", "IDS detects threats, IPS detects and prevents them", "IPS is slower", "IDS is more expensive"],
            "correctAnswer": "IDS detects threats, IPS detects and prevents them",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is AES?",
            "type": "multiple-choice",
            "options": ["Advanced Encryption Standard", "Automatic Encryption System", "Advanced Electronic Security", "Automated Encryption Standard"],
            "correctAnswer": "Advanced Encryption Standard",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: Longer encryption keys generally provide better security.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a security audit?",
            "type": "multiple-choice",
            "options": ["Financial audit", "Systematic evaluation of security measures and policies", "User audit", "Network speed test"],
            "correctAnswer": "Systematic evaluation of security measures and policies",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "Cloud Computing",
    "quizzes": [
      {
        "title": "Cloud Service Models and Deployment",
        "description": "Understanding cloud service models and deployment strategies",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What does IaaS stand for?",
            "type": "multiple-choice",
            "options": ["Infrastructure as a Service", "Internet as a Service", "Information as a Service", "Integration as a Service"],
            "correctAnswer": "Infrastructure as a Service",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does PaaS stand for?",
            "type": "multiple-choice",
            "options": ["Platform as a Service", "Programming as a Service", "Protocol as a Service", "Processing as a Service"],
            "correctAnswer": "Platform as a Service",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does SaaS stand for?",
            "type": "multiple-choice",
            "options": ["System as a Service", "Software as a Service", "Storage as a Service", "Security as a Service"],
            "correctAnswer": "Software as a Service",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the difference between IaaS and PaaS?",
            "type": "short-answer",
            "correctAnswer": "IaaS provides infrastructure resources, PaaS provides platform and tools for application development",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is a public cloud?",
            "type": "multiple-choice",
            "options": ["Cloud open to public viewing", "Cloud services offered over public internet and shared across organizations", "Government cloud", "Free cloud"],
            "correctAnswer": "Cloud services offered over public internet and shared across organizations",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a private cloud?",
            "type": "multiple-choice",
            "options": ["Personal cloud storage", "Cloud infrastructure dedicated to single organization", "Encrypted cloud", "Small cloud"],
            "correctAnswer": "Cloud infrastructure dedicated to single organization",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a hybrid cloud?",
            "type": "multiple-choice",
            "options": ["Mixed technologies", "Combination of public and private cloud environments", "Cloud with multiple providers", "Partially implemented cloud"],
            "correctAnswer": "Combination of public and private cloud environments",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is cloud elasticity?",
            "type": "multiple-choice",
            "options": ["Cloud flexibility", "Ability to scale resources up or down based on demand", "Cloud speed", "Cloud reliability"],
            "correctAnswer": "Ability to scale resources up or down based on demand",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a virtual machine in cloud computing?",
            "type": "multiple-choice",
            "options": ["A physical server", "A software emulation of physical computer", "A cloud storage unit", "A network device"],
            "correctAnswer": "A software emulation of physical computer",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is serverless computing?",
            "type": "multiple-choice",
            "options": ["Computing without servers", "Cloud provider manages server infrastructure while executing code", "Offline computing", "Peer-to-peer computing"],
            "correctAnswer": "Cloud provider manages server infrastructure while executing code",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "True or False: In serverless computing, there are literally no servers involved.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is AWS?",
            "type": "multiple-choice",
            "options": ["American Web Services", "Amazon Web Services", "Automated Web Services", "Advanced Web Services"],
            "correctAnswer": "Amazon Web Services",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is cloud migration?",
            "type": "multiple-choice",
            "options": ["Moving clouds", "Process of moving data and applications to cloud", "Changing cloud providers", "Cloud backup"],
            "correctAnswer": "Process of moving data and applications to cloud",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is multi-tenancy in cloud computing?",
            "type": "short-answer",
            "correctAnswer": "Architecture where single instance of software serves multiple customers while keeping their data isolated",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is object storage in cloud?",
            "type": "multiple-choice",
            "options": ["Storage for objects only", "Storage managing data as objects with metadata and unique identifiers", "File storage", "Block storage"],
            "correctAnswer": "Storage managing data as objects with metadata and unique identifiers",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a cloud region?",
            "type": "multiple-choice",
            "options": ["Cloud type", "Geographic area containing cloud data centers", "Cloud tier", "Cloud protocol"],
            "correctAnswer": "Geographic area containing cloud data centers",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is an availability zone?",
            "type": "multiple-choice",
            "options": ["Time zone", "Isolated location within cloud region with independent infrastructure", "Network zone", "Security zone"],
            "correctAnswer": "Isolated location within cloud region with independent infrastructure",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is cloud bursting?",
            "type": "multiple-choice",
            "options": ["Cloud failure", "Using public cloud resources when private cloud capacity is exceeded", "Rapid scaling", "Cloud termination"],
            "correctAnswer": "Using public cloud resources when private cloud capacity is exceeded",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "True or False: Cloud computing always costs less than on-premises infrastructure.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a container in cloud computing?",
            "type": "multiple-choice",
            "options": ["A storage unit", "Lightweight package containing application and dependencies", "A server type", "A network protocol"],
            "correctAnswer": "Lightweight package containing application and dependencies",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "Mobile App Development",
    "quizzes": [
      {
        "title": "iOS and Android Development Basics",
        "description": "Fundamentals of mobile app development for major platforms",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What programming language is primarily used for iOS development?",
            "type": "multiple-choice",
            "options": ["Java", "Swift", "Kotlin", "C#"],
            "correctAnswer": "Swift",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What programming language is primarily used for modern Android development?",
            "type": "multiple-choice",
            "options": ["Swift", "Objective-C", "Kotlin", "Ruby"],
            "correctAnswer": "Kotlin",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is React Native?",
            "type": "multiple-choice",
            "options": ["A native iOS framework", "A cross-platform framework using JavaScript and React", "An Android library", "A native Android framework"],
            "correctAnswer": "A cross-platform framework using JavaScript and React",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is Flutter?",
            "type": "multiple-choice",
            "options": ["An iOS framework", "A cross-platform framework using Dart language", "An Android framework", "A web framework"],
            "correctAnswer": "A cross-platform framework using Dart language",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the difference between native and hybrid mobile apps?",
            "type": "short-answer",
            "correctAnswer": "Native apps are built for specific platforms using platform languages, hybrid apps use web technologies wrapped in native container",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is Xcode?",
            "type": "multiple-choice",
            "options": ["Android IDE", "Apple's integrated development environment for iOS/macOS", "A code editor", "A testing framework"],
            "correctAnswer": "Apple's integrated development environment for iOS/macOS",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is Android Studio?",
            "type": "multiple-choice",
            "options": ["A design tool", "Official IDE for Android development", "A testing tool", "A database manager"],
            "correctAnswer": "Official IDE for Android development",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is an Activity in Android?",
            "type": "multiple-choice",
            "options": ["User action", "A single screen with user interface", "Background service", "Database operation"],
            "correctAnswer": "A single screen with user interface",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a ViewController in iOS?",
            "type": "multiple-choice",
            "options": ["View manager", "Object managing a view hierarchy for UI", "Animation controller", "Navigation controller"],
            "correctAnswer": "Object managing a view hierarchy for UI",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the Android Manifest file?",
            "type": "multiple-choice",
            "options": ["App documentation", "XML file containing essential app information and configurations", "Build script", "Resource file"],
            "correctAnswer": "XML file containing essential app information and configurations",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "True or False: React Native apps are compiled to native code.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is SQLite in mobile development?",
            "type": "multiple-choice",
            "options": ["Network protocol", "Lightweight relational database for local storage", "Cloud database", "NoSQL database"],
            "correctAnswer": "Lightweight relational database for local storage",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What are push notifications?",
            "type": "multiple-choice",
            "options": ["Local alerts", "Messages sent from server to mobile device", "In-app messages", "Email notifications"],
            "correctAnswer": "Messages sent from server to mobile device",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is an APK?",
            "type": "multiple-choice",
            "options": ["App Programming Kit", "Android Package file format for app distribution", "Application Protocol Key", "Android Programming Kit"],
            "correctAnswer": "Android Package file format for app distribution",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the iOS equivalent of APK?",
            "type": "multiple-choice",
            "options": ["IPA", "APP", "IOS", "PKG"],
            "correctAnswer": "IPA",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is MVP architecture in mobile development?",
            "type": "short-answer",
            "correctAnswer": "Model-View-Presenter pattern separating business logic from UI presentation",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is MVVM architecture?",
            "type": "multiple-choice",
            "options": ["Model-View-Visual-Manager", "Model-View-ViewModel pattern", "Multiple-View-Variable-Model", "Model-Variable-View-Manager"],
            "correctAnswer": "Model-View-ViewModel pattern",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is Firebase?",
            "type": "multiple-choice",
            "options": ["A database only", "Google's platform providing backend services for mobile apps", "An analytics tool", "A UI framework"],
            "correctAnswer": "Google's platform providing backend services for mobile apps",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: Mobile apps must be optimized for battery consumption.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is responsive design in mobile development?",
            "type": "multiple-choice",
            "options": ["Fast response time", "UI adapting to different screen sizes and orientations", "Quick loading", "Gesture response"],
            "correctAnswer": "UI adapting to different screen sizes and orientations",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "DevOps",
    "quizzes": [
      {
        "title": "CI/CD and Infrastructure Automation",
        "description": "Continuous integration, deployment, and infrastructure as code",
        "difficulty": "hard",
        "level": "advanced",
        "duration": 30,
        "questions": [
          {
            "question": "What does CI/CD stand for?",
            "type": "multiple-choice",
            "options": ["Continuous Integration/Continuous Deployment", "Central Integration/Central Deployment", "Code Integration/Code Deployment", "Continuous Improvement/Continuous Development"],
            "correctAnswer": "ContinuousIntegration/Continuous Deployment",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the primary goal of DevOps?",
            "type": "multiple-choice",
            "options": ["Separate development and operations", "Bridge gap between development and operations for faster delivery", "Only automate testing", "Replace developers"],
            "correctAnswer": "Bridge gap between development and operations for faster delivery",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is Docker?",
            "type": "multiple-choice",
            "options": ["A cloud provider", "A containerization platform", "A programming language", "A database"],
            "correctAnswer": "A containerization platform",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is Kubernetes?",
            "type": "multiple-choice",
            "options": ["A container runtime", "A container orchestration platform", "A version control system", "A CI/CD tool"],
            "correctAnswer": "A container orchestration platform",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is Infrastructure as Code (IaC)?",
            "type": "short-answer",
            "correctAnswer": "Managing and provisioning infrastructure through machine-readable definition files rather than manual processes",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is Terraform?",
            "type": "multiple-choice",
            "options": ["A cloud provider", "An IaC tool for building and managing infrastructure", "A monitoring tool", "A container platform"],
            "correctAnswer": "An IaC tool for building and managing infrastructure",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is Jenkins?",
            "type": "multiple-choice",
            "options": ["A database", "An automation server for CI/CD pipelines", "A cloud platform", "A container orchestrator"],
            "correctAnswer": "An automation server for CI/CD pipelines",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the difference between a container and a virtual machine?",
            "type": "short-answer",
            "correctAnswer": "Containers share host OS kernel and are lightweight, VMs include full OS and are heavier",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is Ansible?",
            "type": "multiple-choice",
            "options": ["A monitoring tool", "A configuration management and automation tool", "A container platform", "A cloud provider"],
            "correctAnswer": "A configuration management and automation tool",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a pipeline in CI/CD?",
            "type": "multiple-choice",
            "options": ["A data flow", "An automated sequence of stages for building, testing, and deploying code", "A network connection", "A storage system"],
            "correctAnswer": "An automated sequence of stages for building, testing, and deploying code",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: Blue-green deployment allows zero-downtime releases.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is GitOps?",
            "type": "multiple-choice",
            "options": ["Git operations", "Using Git as single source of truth for declarative infrastructure", "Git for operations team", "Git-based development"],
            "correctAnswer": "Using Git as single source of truth for declarative infrastructure",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is Prometheus used for?",
            "type": "multiple-choice",
            "options": ["Container orchestration", "Monitoring and alerting", "CI/CD", "Configuration management"],
            "correctAnswer": "Monitoring and alerting",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is Grafana?",
            "type": "multiple-choice",
            "options": ["A database", "A visualization and analytics platform", "A container platform", "A CI/CD tool"],
            "correctAnswer": "A visualization and analytics platform",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a Docker image?",
            "type": "multiple-choice",
            "options": ["A running container", "A read-only template for creating containers", "A virtual machine", "A configuration file"],
            "correctAnswer": "A read-only template for creating containers",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the ELK stack?",
            "type": "multiple-choice",
            "options": ["Error Logging Kit", "Elasticsearch, Logstash, Kibana for logging and analytics", "Enhanced Linux Kernel", "Enterprise Logging Kit"],
            "correctAnswer": "Elasticsearch, Logstash, Kibana for logging and analytics",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is continuous monitoring in DevOps?",
            "type": "multiple-choice",
            "options": ["Watching developers work", "Ongoing observation of applications and infrastructure performance", "Testing code continuously", "Reviewing code changes"],
            "correctAnswer": "Ongoing observation of applications and infrastructure performance",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a microservices architecture?",
            "type": "short-answer",
            "correctAnswer": "Architectural style structuring application as collection of loosely coupled, independently deployable services",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "True or False: DevOps eliminates the need for operations teams.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is canary deployment?",
            "type": "multiple-choice",
            "options": ["Deploying to production", "Gradually rolling out changes to small subset of users before full deployment", "Emergency deployment", "Automatic deployment"],
            "correctAnswer": "Gradually rolling out changes to small subset of users before full deployment",
            "difficulty": "hard",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "Blockchain Technology",
    "quizzes": [
      {
        "title": "Blockchain Fundamentals and Cryptocurrencies",
        "description": "Core blockchain concepts and cryptocurrency basics",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What is blockchain?",
            "type": "multiple-choice",
            "options": ["A type of database", "A distributed ledger technology with linked blocks of data", "A cryptocurrency", "A programming language"],
            "correctAnswer": "A distributed ledger technology with linked blocks of data",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is Bitcoin?",
            "type": "multiple-choice",
            "options": ["A blockchain platform", "The first decentralized cryptocurrency", "A company", "A programming language"],
            "correctAnswer": "The first decentralized cryptocurrency",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a smart contract?",
            "type": "multiple-choice",
            "options": ["A legal contract", "Self-executing code on blockchain with predefined conditions", "An AI contract", "A digital signature"],
            "correctAnswer": "Self-executing code on blockchain with predefined conditions",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is Ethereum?",
            "type": "multiple-choice",
            "options": ["A cryptocurrency only", "A blockchain platform for smart contracts and dApps", "A mining company", "A wallet"],
            "correctAnswer": "A blockchain platform for smart contracts and dApps",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is mining in blockchain?",
            "type": "short-answer",
            "correctAnswer": "Process of validating transactions and adding new blocks to blockchain by solving computational puzzles",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is Proof of Work (PoW)?",
            "type": "multiple-choice",
            "options": ["Work verification", "Consensus mechanism requiring computational work to validate transactions", "Employment proof", "Work documentation"],
            "correctAnswer": "Consensus mechanism requiring computational work to validate transactions",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is Proof of Stake (PoS)?",
            "type": "multiple-choice",
            "options": ["Stake validation", "Consensus mechanism where validators are chosen based on stake amount", "Investment proof", "Stake documentation"],
            "correctAnswer": "Consensus mechanism where validators are chosen based on stake amount",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a blockchain node?",
            "type": "multiple-choice",
            "options": ["A block in chain", "A computer maintaining copy of blockchain and validating transactions", "A transaction", "A wallet"],
            "correctAnswer": "A computer maintaining copy of blockchain and validating transactions",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a cryptocurrency wallet?",
            "type": "multiple-choice",
            "options": ["Physical wallet", "Digital tool for storing private keys and managing crypto assets", "A bank account", "A mining device"],
            "correctAnswer": "Digital tool for storing private keys and managing crypto assets",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a private key in blockchain?",
            "type": "multiple-choice",
            "options": ["A password", "Cryptographic key allowing owner to access and control assets", "A username", "A transaction ID"],
            "correctAnswer": "Cryptographic key allowing owner to access and control assets",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: Blockchain transactions can be reversed or modified.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a decentralized application (dApp)?",
            "type": "multiple-choice",
            "options": ["A mobile app", "An application running on decentralized blockchain network", "A web app", "A desktop app"],
            "correctAnswer": "An application running on decentralized blockchain network",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a token in blockchain?",
            "type": "multiple-choice",
            "options": ["A password", "Digital asset created on existing blockchain platform", "A mining reward", "A transaction fee"],
            "correctAnswer": "Digital asset created on existing blockchain platform",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is an NFT?",
            "type": "multiple-choice",
            "options": ["New Financial Token", "Non-Fungible Token representing unique digital asset", "Network File Transfer", "Native Function Token"],
            "correctAnswer": "Non-Fungible Token representing unique digital asset",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is DeFi?",
            "type": "short-answer",
            "correctAnswer": "Decentralized Finance - financial services using blockchain without traditional intermediaries",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is a consensus mechanism?",
            "type": "multiple-choice",
            "options": ["Agreement protocol", "Method for nodes to agree on blockchain state and validate transactions", "Voting system", "Decision making"],
            "correctAnswer": "Method for nodes to agree on blockchain state and validate transactions",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is gas in Ethereum?",
            "type": "multiple-choice",
            "options": ["Fuel for cars", "Unit measuring computational effort for transactions", "A cryptocurrency", "Storage unit"],
            "correctAnswer": "Unit measuring computational effort for transactions",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a blockchain fork?",
            "type": "multiple-choice",
            "options": ["A bug", "A divergence in blockchain creating two separate chains", "A merge", "A deletion"],
            "correctAnswer": "A divergence in blockchain creating two separate chains",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "True or False: All blockchains are public and transparent.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a hash in blockchain?",
            "type": "multiple-choice",
            "options": ["A tag", "Cryptographic function output uniquely identifying block data", "A link", "A password"],
            "correctAnswer": "Cryptographic function output uniquely identifying block data",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "AI Fundamentals",
    "quizzes": [
      {
        "title": "Artificial Intelligence Core Concepts",
        "description": "Foundational AI concepts and techniques",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What is Artificial Intelligence?",
            "type": "multiple-choice",
            "options": ["Human intelligence", "Simulation of human intelligence by machines", "Robot intelligence", "Computer programming"],
            "correctAnswer": "Simulation of human intelligence by machines",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the difference between AI and Machine Learning?",
            "type": "short-answer",
            "correctAnswer": "AI is broader field of intelligent machines, ML is subset of AI focusing on learning from data",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is Natural Language Processing (NLP)?",
            "type": "multiple-choice",
            "options": ["Language translation", "AI field enabling computers to understand and process human language", "Speech recognition only", "Text editing"],
            "correctAnswer": "AI field enabling computers to understand and process human language",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is computer vision?",
            "type": "multiple-choice",
            "options": ["Eye tracking", "AI field enabling computers to interpret visual information", "Screen resolution", "Image editing"],
            "correctAnswer": "AI field enabling computers to interpret visual information",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is reinforcement learning?",
            "type": "multiple-choice",
            "options": ["Supervised learning", "Learning through trial and error with rewards and penalties", "Unsupervised learning", "Transfer learning"],
            "correctAnswer": "Learning through trial and error with rewards and penalties",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is an expert system?",
            "type": "multiple-choice",
            "options": ["A database", "AI system emulating decision-making of human expert", "A search engine", "A neural network"],
            "correctAnswer": "AI system emulating decision-making of human expert",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the Turing Test?",
            "type": "multiple-choice",
            "options": ["Performance test", "Test of machine's ability to exhibit intelligent behavior indistinguishable from human", "Speed test", "Memory test"],
            "correctAnswer": "Test of machine's ability to exhibit intelligent behavior indistinguishable from human",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What are neural networks inspired by?",
            "type": "multiple-choice",
            "options": ["Computer networks", "Human brain structure and function", "Internet", "Database systems"],
            "correctAnswer": "Human brain structure and function",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is weak AI vs strong AI?",
            "type": "short-answer",
            "correctAnswer": "Weak AI performs specific tasks, strong AI possesses general human-like intelligence across domains",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is a knowledge base in AI?",
            "type": "multiple-choice",
            "options": ["A database", "Repository of information used by AI system for reasoning", "A learning algorithm", "A neural network"],
            "correctAnswer": "Repository of information used by AI system for reasoning",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: AI systems can learn and improve without human intervention.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is search algorithm in AI?",
            "type": "multiple-choice",
            "options": ["Web search", "Algorithm for finding solutions by exploring possible states", "Database query", "File search"],
            "correctAnswer": "Algorithm for finding solutions by exploring possible states",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is inference in AI?",
            "type": "multiple-choice",
            "options": ["Data collection", "Drawing conclusions from available information", "Training process", "Data storage"],
            "correctAnswer": "Drawing conclusions from available information",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a chatbot?",
            "type": "multiple-choice",
            "options": ["A game character", "AI program that simulates human conversation", "A messaging app", "A robot"],
            "correctAnswer": "AI program that simulates human conversation",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is pattern recognition in AI?",
            "type": "multiple-choice",
            "options": ["Design patterns", "Identifying patterns and regularities in data", "Image editing", "Code patterns"],
            "correctAnswer": "Identifying patterns and regularities in data",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is fuzzy logic?",
            "type": "multiple-choice",
            "options": ["Unclear logic", "Logic dealing with approximate rather than precise reasoning", "Boolean logic", "Error logic"],
            "correctAnswer": "Logic dealing with approximate rather than precise reasoning",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is autonomous AI?",
            "type": "multiple-choice",
            "options": ["Independent AI", "AI capable of performing tasks without human intervention", "Self-learning AI", "AI with consciousness"],
            "correctAnswer": "AI capable of performing tasks without human intervention",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the Chinese Room argument about?",
            "type": "multiple-choice",
            "options": ["Translation", "Philosophical argument questioning if machines truly understand", "Language learning", "Cultural AI"],
            "correctAnswer": "Philosophical argument questioning if machines truly understand",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "True or False: AI bias can result from biased training data.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is explainable AI (XAI)?",
            "type": "short-answer",
            "correctAnswer": "AI systems whose decisions and processes can be understood and interpreted by humans",
            "difficulty": "hard",
            "points": 2
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "Software Engineering",
    "quizzes": [
      {
        "title": "Software Development Lifecycle and Methodologies",
        "description": "SDLC models, Agile, and software engineering practices",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What does SDLC stand for?",
            "type": "multiple-choice",
            "options": ["Software Development Life Cycle", "System Design Life Cycle", "Software Design Life Cycle", "System Development Life Cycle"],
            "correctAnswer": "Software Development Life Cycle",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the Waterfall model?",
            "type": "multiple-choice",
            "options": ["Iterative model", "Sequential SDLC model with distinct phases", "Agile model", "Spiral model"],
            "correctAnswer": "Sequential SDLC model with distinct phases",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is Agile methodology?",
            "type": "short-answer",
            "correctAnswer": "Iterative approach to software development emphasizing flexibility, collaboration, and customer feedback",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is Scrum?",
            "type": "multiple-choice",
            "options": ["A programming language", "An Agile framework for managing product development", "A testing method", "A design pattern"],
            "correctAnswer": "An Agile framework for managing product development",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a sprint in Scrum?",
            "type": "multiple-choice",
            "options": ["Fast coding", "Time-boxed iteration for completing work", "Running tests", "Deployment phase"],
            "correctAnswer": "Time-boxed iteration for completing work",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a user story?",
            "type": "multiple-choice",
            "options": ["User documentation", "Informal description of feature from user perspective", "User manual", "Biography"],
            "correctAnswer": "Informal description of feature from user perspective",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is version control?",
            "type": "multiple-choice",
            "options": ["Software versioning", "System for tracking changes to code over time", "Quality control", "Release management"],
            "correctAnswer": "System for tracking changes to code over time",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is Git?",
            "type": "multiple-choice",
            "options": ["A programming language", "A distributed version control system", "A cloud service", "An IDE"],
            "correctAnswer": "A distributed version control system",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is code review?",
            "type": "multiple-choice",
            "options": ["Reading documentation", "Systematic examination of code by peers", "Testing code", "Debugging"],
            "correctAnswer": "Systematic examination of code by peers",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is technical debt?",
            "type": "short-answer",
            "correctAnswer": "Cost of additional rework caused by choosing quick solution over better approach that would take longer",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "True or False: Agile eliminates the need for documentation.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is refactoring?",
            "type": "multiple-choice",
            "options": ["Rewriting code", "Restructuring code without changing external behavior", "Fixing bugs", "Adding features"],
            "correctAnswer": "Restructuring code without changing external behavior",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is pair programming?",
            "type": "multiple-choice",
            "options": ["Two programs", "Two developers working together at one workstation", "Parallel programming", "Duplicate code"],
            "correctAnswer": "Two developers working together at one workstation",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is continuous integration?",
            "type": "multiple-choice",
            "options": ["Continuous coding", "Frequently integrating code changes into shared repository", "Non-stop development", "Always online"],
            "correctAnswer": "Frequently integrating code changes into shared repository",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a design pattern?",
            "type": "multiple-choice",
            "options": ["UI design", "Reusable solution to common software design problem", "Code template", "Visual design"],
            "correctAnswer": "Reusable solution to common software design problem",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is unit testing?",
            "type": "multiple-choice",
            "options": ["Testing whole system", "Testing individual units or components", "User testing", "Integration testing"],
            "correctAnswer": "Testing individual units or components",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the difference between unit testing and integration testing?",
            "type": "short-answer",
            "correctAnswer": "Unit testing tests individual components in isolation, integration testing tests how components work together",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is TDD?",
            "type": "multiple-choice",
            "options": ["Technical Design Document", "Test-Driven Development", "Total Development Duration", "Technical Debt Development"],
            "correctAnswer": "Test-Driven Development",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: In TDD, tests are written before the actual code.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a standup meeting in Agile?",
            "type": "multiple-choice",
            "options": ["Formal presentation", "Brief daily team synchronization meeting", "Standing ovation", "Final review"],
            "correctAnswer": "Brief daily team synchronization meeting",
            "difficulty": "easy",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "Graphic Design Basics",
    "quizzes": [
      {
        "title": "Design Principles and Color Theory",
        "description": "Fundamental design principles and color usage",
        "difficulty": "easy",
        "level": "beginner",
        "duration": 20,
        "questions": [
          {
            "question": "What are the primary colors in color theory?",
            "type": "multiple-choice",
            "options": ["Red, Green, Blue", "Red, Yellow, Blue", "Cyan, Magenta, Yellow", "Black, White, Gray"],
            "correctAnswer": "Red, Yellow, Blue",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is contrast in design?",
            "type": "multiple-choice",
            "options": ["Same colors", "Difference between elements to create visual interest", "Matching elements", "Similar shapes"],
            "correctAnswer": "Difference between elements to create visual interest",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is white space (negative space) in design?",
            "type": "multiple-choice",
            "options": ["Empty white areas only", "Empty space around and between elements", "Background color", "Margins only"],
            "correctAnswer": "Empty space around and between elements",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is typography?",
            "type": "multiple-choice",
            "options": ["Type of paper", "Art and technique of arranging type", "Printing method", "Computer font"],
            "correctAnswer": "Art and technique of arranging type",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the difference between RGB and CMYK?",
            "type": "short-answer",
            "correctAnswer": "RGB is additive color for screens (Red Green Blue), CMYK is subtractive color for print (Cyan Magenta Yellow Black)",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is balance in design?",
            "type": "multiple-choice",
            "options": ["Equal weight", "Distribution of visual weight in composition", "Symmetry only", "Color matching"],
            "correctAnswer": "Distribution of visual weight in composition",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a serif font?",
            "type": "multiple-choice",
            "options": ["Sans-serif font", "Font with small decorative strokes at letter ends", "Script font", "Display font"],
            "correctAnswer": "Font with small decorative strokes at letter ends",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is hierarchy in design?",
            "type": "multiple-choice",
            "options": ["Organization chart", "Arrangement of elements by importance", "Tree structure", "Management system"],
            "correctAnswer": "Arrangement of elements by importance",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What are complementary colors?",
            "type": "multiple-choice",
            "options": ["Similar colors", "Colors opposite each other on color wheel", "Matching colors", "Neutral colors"],
            "correctAnswer": "Colors opposite each other on color wheel",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is kerning?",
            "type": "multiple-choice",
            "options": ["Line spacing", "Spacing between individual letter pairs", "Paragraph spacing", "Word spacing"],
            "correctAnswer": "Spacing between individual letter pairs",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: Vector graphics lose quality when scaled.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is leading in typography?",
            "type": "multiple-choice",
            "options": ["First letter", "Vertical space between lines of text", "Letter spacing", "Margin"],
            "correctAnswer": "Vertical space between lines of text",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the golden ratio in design?",
            "type": "multiple-choice",
            "options": ["50:50 ratio", "Mathematical ratio of approximately 1:1.618","1:1 ratio", "2:1 ratio"],
            "correctAnswer": "Mathematical ratio of approximately 1:1.618",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a monochromatic color scheme?",
            "type": "multiple-choice",
            "options": ["Black and white only", "Variations of single color", "Multiple colors", "Primary colors only"],
            "correctAnswer": "Variations of single color",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is alignment in design?",
            "type": "short-answer",
            "correctAnswer": "Positioning elements to create visual connection and organization",
            "difficulty": "easy",
            "points": 2
          },
          {
            "question": "What is the difference between raster and vector graphics?",
            "type": "multiple-choice",
            "options": ["No difference", "Raster uses pixels, vector uses mathematical paths", "Raster is newer", "Vector is for web only"],
            "correctAnswer": "Raster uses pixels, vector uses mathematical paths",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is visual hierarchy?",
            "type": "multiple-choice",
            "options": ["Management structure", "Guiding viewer's eye through design in order of importance", "Color arrangement", "Size variation"],
            "correctAnswer": "Guiding viewer's eye through design in order of importance",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does DPI stand for in print design?",
            "type": "multiple-choice",
            "options": ["Digital Print Image", "Dots Per Inch", "Design Print Index", "Data Point Interface"],
            "correctAnswer": "Dots Per Inch",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "True or False: Helvetica is a serif typeface.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is repetition as a design principle?",
            "type": "multiple-choice",
            "options": ["Copying designs", "Using consistent elements to create unity", "Duplicating layers", "Repeating colors only"],
            "correctAnswer": "Using consistent elements to create unity",
            "difficulty": "easy",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "Digital Illustration",
    "quizzes": [
      {
        "title": "Digital Drawing Techniques and Tools",
        "description": "Digital illustration fundamentals and techniques",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What is a drawing tablet?",
            "type": "multiple-choice",
            "options": ["A mobile device", "Input device allowing digital drawing with pen or stylus", "A software", "A display screen"],
            "correctAnswer": "Input device allowing digital drawing with pen or stylus",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is pressure sensitivity in digital drawing?",
            "type": "multiple-choice",
            "options": ["Tablet weight", "Pen responding to varying pressure creating different line weights", "Screen pressure", "Software setting"],
            "correctAnswer": "Pen responding to varying pressure creating different line weights",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What are layers in digital illustration?",
            "type": "short-answer",
            "correctAnswer": "Transparent sheets stacked on top of each other allowing separate editing of different elements",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is the difference between raster and vector illustration?",
            "type": "multiple-choice",
            "options": ["No difference", "Raster uses pixels, vector uses mathematical curves", "Vector is older", "Raster is for print only"],
            "correctAnswer": "Raster uses pixels, vector uses mathematical curves",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a brush preset?",
            "type": "multiple-choice",
            "options": ["Preset color", "Saved brush configuration with specific properties", "Canvas size", "Layer setting"],
            "correctAnswer": "Saved brush configuration with specific properties",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is color picking in digital art?",
            "type": "multiple-choice",
            "options": ["Choosing colors randomly", "Sampling colors from existing artwork or palette", "Deleting colors", "Mixing paints"],
            "correctAnswer": "Sampling colors from existing artwork or palette",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is anti-aliasing?",
            "type": "multiple-choice",
            "options": ["Removing art", "Smoothing jagged edges in digital images", "Adding texture", "Creating aliases"],
            "correctAnswer": "Smoothing jagged edges in digital images",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a clipping mask?",
            "type": "multiple-choice",
            "options": ["Cutting tool", "Layer that restricts visibility to shape of layer below", "Selection tool", "Masking tape"],
            "correctAnswer": "Layer that restricts visibility to shape of layer below",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is blending mode?",
            "type": "multiple-choice",
            "options": ["Mixing colors physically", "Setting determining how layer interacts with layers below", "Brush setting", "Color mode"],
            "correctAnswer": "Setting determining how layer interacts with layers below",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is opacity in digital art?",
            "type": "multiple-choice",
            "options": ["Color brightness", "Transparency level of layer or brush", "Image quality", "Brush size"],
            "correctAnswer": "Transparency level of layer or brush",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "True or False: Digital illustration cannot replicate traditional media textures.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the purpose of a reference image?",
            "type": "multiple-choice",
            "options": ["Copyright material", "Visual guide for accuracy and inspiration", "Final artwork", "Background image"],
            "correctAnswer": "Visual guide for accuracy and inspiration",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is line weight variation?",
            "type": "short-answer",
            "correctAnswer": "Using different line thicknesses to create depth, emphasis, and visual interest",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is a color palette?",
            "type": "multiple-choice",
            "options": ["Physical paint palette", "Selected set of colors for artwork", "Canvas board", "Drawing tablet"],
            "correctAnswer": "Selected set of colors for artwork",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is cel shading?",
            "type": "multiple-choice",
            "options": ["Cell phone drawing", "Flat coloring technique with minimal shading", "3D rendering", "Photo editing"],
            "correctAnswer": "Flat coloring technique with minimal shading",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is gesture drawing?",
            "type": "multiple-choice",
            "options": ["Hand movements", "Quick sketches capturing movement and form", "Sign language", "Detailed drawing"],
            "correctAnswer": "Quick sketches capturing movement and form",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the purpose of thumbnail sketches?",
            "type": "multiple-choice",
            "options": ["Small final artworks", "Quick small sketches exploring composition ideas", "Profile pictures", "Miniature paintings"],
            "correctAnswer": "Quick small sketches exploring composition ideas",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is color theory's importance in digital illustration?",
            "type": "multiple-choice",
            "options": ["Not important", "Understanding color relationships creates harmonious and effective artwork", "Only for print", "Only for beginners"],
            "correctAnswer": "Understanding color relationships creates harmonious and effective artwork",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "True or False: Digital art requires understanding of traditional art fundamentals.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a smart object in digital illustration software?",
            "type": "multiple-choice",
            "options": ["AI drawing", "Layer preserving source content with non-destructive editing", "Intelligent brush", "Automated tool"],
            "correctAnswer": "Layer preserving source content with non-destructive editing",
            "difficulty": "hard",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "3D Modeling",
    "quizzes": [
      {
        "title": "3D Modeling Fundamentals and Techniques",
        "description": "Core 3D modeling concepts and workflows",
        "difficulty": "hard",
        "level": "advanced",
        "duration": 30,
        "questions": [
          {
            "question": "What is a polygon in 3D modeling?",
            "type": "multiple-choice",
            "options": ["2D shape", "Flat surface defined by vertices forming faces", "3D object", "Texture"],
            "correctAnswer": "Flat surface defined by vertices forming faces",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the difference between vertices, edges, and faces?",
            "type": "short-answer",
            "correctAnswer": "Vertices are points, edges are lines connecting vertices, faces are surfaces enclosed by edges",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is extrusion in 3D modeling?",
            "type": "multiple-choice",
            "options": ["Deleting faces", "Extending geometry outward from existing surface", "Rotating objects", "Scaling objects"],
            "correctAnswer": "Extending geometry outward from existing surface",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is UV mapping?",
            "type": "multiple-choice",
            "options": ["Light mapping", "Process of projecting 2D texture onto 3D model surface", "Color grading", "Vertex painting"],
            "correctAnswer": "Process of projecting 2D texture onto 3D model surface",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is subdivision surface modeling?",
            "type": "multiple-choice",
            "options": ["Dividing objects", "Technique creating smooth surfaces by subdividing polygon mesh", "Surface deletion", "Texture subdivision"],
            "correctAnswer": "Technique creating smooth surfaces by subdividing polygon mesh",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a normal in 3D graphics?",
            "type": "multiple-choice",
            "options": ["Standard model", "Vector perpendicular to surface determining facing direction", "Average value", "Regular polygon"],
            "correctAnswer": "Vector perpendicular to surface determining facing direction",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is the difference between organic and hard surface modeling?",
            "type": "short-answer",
            "correctAnswer": "Organic models natural shapes like characters, hard surface models mechanical objects with clean edges",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is topology in 3D modeling?",
            "type": "multiple-choice",
            "options": ["Model location", "Arrangement and flow of polygon edges and vertices", "Model hierarchy", "Surface texture"],
            "correctAnswer": "Arrangement and flow of polygon edges and vertices",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a mesh in 3D modeling?",
            "type": "multiple-choice",
            "options": ["Texture pattern", "Collection of vertices, edges, and faces defining 3D shape", "Wire frame", "Grid system"],
            "correctAnswer": "Collection of vertices, edges, and faces defining 3D shape",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is rigging in 3D?",
            "type": "multiple-choice",
            "options": ["Modeling process", "Creating skeleton structure for animation", "Rendering setup", "Lighting setup"],
            "correctAnswer": "Creating skeleton structure for animation",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: High polygon count always results in better 3D models.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is PBR in 3D materials?",
            "type": "multiple-choice",
            "options": ["Physical Body Rendering", "Physically Based Rendering", "Pixel Based Rendering", "Procedural Base Rendering"],
            "correctAnswer": "Physically Based Rendering",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a skybox in 3D environments?",
            "type": "multiple-choice",
            "options": ["Cloud model", "Background cube with environment imagery", "Ceiling object", "Light source"],
            "correctAnswer": "Background cube with environment imagery",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is baking in 3D graphics?",
            "type": "multiple-choice",
            "options": ["Heating models", "Converting lighting and texture information into texture maps", "Rendering final image", "Exporting models"],
            "correctAnswer": "Converting lighting and texture information into texture maps",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is the purpose of LOD (Level of Detail)?",
            "type": "short-answer",
            "correctAnswer": "Using different polygon counts for same model based on distance to optimize performance",
            "difficulty": "hard",
            "points": 2
          },
          {
            "question": "What is ambient occlusion?",
            "type": "multiple-choice",
            "options": ["Ambient lighting", "Shading effect where surfaces close together appear darker", "Reflection effect", "Transparency setting"],
            "correctAnswer": "Shading effect where surfaces close together appear darker",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a primitive in 3D modeling?",
            "type": "multiple-choice",
            "options": ["Ancient model", "Basic geometric shape like cube, sphere, or cylinder", "First model created", "Simple texture"],
            "correctAnswer": "Basic geometric shape like cube, sphere, or cylinder",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is Boolean operation in 3D?",
            "type": "multiple-choice",
            "options": ["Logic operation", "Combining or subtracting meshes to create new shapes", "True/false operation", "Mathematical calculation"],
            "correctAnswer": "Combining or subtracting meshes to create new shapes",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: Real-time rendering and offline rendering use the same techniques.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a bump map?",
            "type": "multiple-choice",
            "options": ["Collision detection", "Texture creating illusion of depth without changing geometry", "Height map", "Displacement map"],
            "correctAnswer": "Texture creating illusion of depth without changing geometry",
            "difficulty": "hard",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "Animation Principles",
    "quizzes": [
      {
        "title": "The 12 Principles of Animation",
        "description": "Disney's fundamental animation principles",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What is the principle of 'Squash and Stretch'?",
            "type": "multiple-choice",
            "options": ["Breaking objects", "Giving illusion of weight and flexibility by deforming objects", "Stretching timeline", "Compressing files"],
            "correctAnswer": "Giving illusion of weight and flexibility by deforming objects",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is 'Anticipation' in animation?",
            "type": "multiple-choice",
            "options": ["Waiting for render", "Preparing audience for major action", "Being excited", "Predicting movement"],
            "correctAnswer": "Preparing audience for major action",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does 'Staging' mean in animation?",
            "type": "short-answer",
            "correctAnswer": "Presenting idea clearly through composition, camera angle, and action to direct audience attention",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is 'Straight Ahead Action vs Pose to Pose'?",
            "type": "multiple-choice",
            "options": ["Two camera angles", "Two animation approaches - continuous drawing vs key poses", "Two movement types", "Two software methods"],
            "correctAnswer": "Two animation approaches - continuous drawing vs key poses",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is 'Follow Through and Overlapping Action'?",
            "type": "multiple-choice",
            "options": ["Following characters", "Different parts of body moving at different rates", "Continuing story", "Repeating actions"],
            "correctAnswer": "Different parts of body moving at different rates",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is 'Slow In and Slow Out'?",
            "type": "multiple-choice",
            "options": ["Gradual speed changes", "Movement starting and ending slowly with more frames at extremes", "Slow motion effect", "Loading time"],
            "correctAnswer": "Movement starting and ending slowly with more frames at extremes",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "Why is 'Arc' important in animation?",
            "type": "multiple-choice",
            "options": ["Circular shapes", "Natural movement follows curved paths rather than straight lines", "Arc lights", "Story arcs"],
            "correctAnswer": "Natural movement follows curved paths rather than straight lines",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is 'Secondary Action'?",
            "type": "multiple-choice",
            "options": ["Second animation", "Additional action supporting main action and adding dimension", "Backup action", "Alternative movement"],
            "correctAnswer": "Additional action supporting main action and adding dimension",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What does 'Timing' control in animation?",
            "type": "multiple-choice",
            "options": ["Clock time", "Number of frames for action affecting weight, mood, and meaning", "Schedule", "Duration"],
            "correctAnswer": "Number of frames for action affecting weight, mood, and meaning",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is 'Exaggeration' in animation?",
            "type": "short-answer",
            "correctAnswer": "Pushing movements, expressions, or situations beyond reality for emphasis and entertainment",
            "difficulty": "easy",
            "points": 2
          },
          {
            "question": "True or False: The 12 principles only apply to 2D animation.",
            "type": "true-false",
            "correctAnswer": "false",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is 'Solid Drawing'?",
            "type": "multiple-choice",
            "options": ["Drawing on solid surface", "Creating forms with weight, depth, and balance in 3D space", "Thick lines", "Complete drawings"],
            "correctAnswer": "Creating forms with weight, depth, and balance in 3D space",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is 'Appeal' in animation?",
            "type": "multiple-choice",
            "options": ["Popular animation", "Creating charismatic and interesting characters viewers want to watch", "Asking for help", "Visual attraction"],
            "correctAnswer": "Creating charismatic and interesting characters viewers want to watch",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a keyframe?",
            "type": "multiple-choice",
            "options": ["Important frame", "Frame defining start or end point of smooth transition", "Locked frame", "First frame"],
            "correctAnswer": "Frame defining start or end point of smooth transition",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is tweening in animation?",
            "type": "multiple-choice",
            "options": ["Teenage animation", "Generating intermediate frames between keyframes", "Double animation", "Frame editing"],
            "correctAnswer": "Generating intermediate frames between keyframes",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the difference between 2D and 3D animation?",
            "type": "short-answer",
            "correctAnswer": "2D creates movement in flat two-dimensional space, 3D creates movement in three-dimensional digital space",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is frame rate?",
            "type": "multiple-choice",
            "options": ["Picture frame cost", "Number of frames displayed per second", "Speed of rendering", "Animation quality"],
            "correctAnswer": "Number of frames displayed per second",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is motion blur in animation?",
            "type": "multiple-choice",
            "options": ["Blurry animation", "Visual effect simulating blur of fast-moving objects", "Out of focus", "Error in rendering"],
            "correctAnswer": "Visual effect simulating blur of fast-moving objects",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "True or False: Animation at 24 fps appears smooth to human eye.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is rotoscoping?",
            "type": "multiple-choice",
            "options": ["Rotating objects", "Tracing over live-action footage frame by frame", "Scope rotation", "Animation review"],
            "correctAnswer": "Tracing over live-action footage frame by frame",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "UI/UX Design",
    "quizzes": [
      {
        "title": "User Experience and Interface Design",
        "description": "UX research, wireframing, prototyping, and usability",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What is the difference between UI and UX?",
            "type": "short-answer",
            "correctAnswer": "UI is visual interface design, UX is overall user experience and interaction with product",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is a wireframe?",
            "type": "multiple-choice",
            "options": ["Wire structure", "Low-fidelity blueprint of interface layout", "Framework code", "Wire diagram"],
            "correctAnswer": "Low-fidelity blueprint of interface layout",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a prototype?",
            "type": "multiple-choice",
            "options": ["First user", "Interactive mockup simulating final product functionality", "Beta version", "Initial design"],
            "correctAnswer": "Interactive mockup simulating final product functionality",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a user persona?",
            "type": "multiple-choice",
            "options": ["Real user", "Fictional character representing user type", "User profile", "Username"],
            "correctAnswer": "Fictional character representing user type",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is usability testing?",
            "type": "multiple-choice",
            "options": ["Testing if it works", "Evaluating product by testing with representative users", "Quality assurance", "Performance testing"],
            "correctAnswer": "Evaluating product by testing with representative users",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is information architecture?",
            "type": "multiple-choice",
            "options": ["Building design", "Organizing and structuring content for findability", "Data architecture", "System architecture"],
            "correctAnswer": "Organizing and structuring content for findability",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is a user journey map?",
            "type": "short-answer",
            "correctAnswer": "Visual representation of user's experience with product over time across touchpoints",
            "difficulty": "medium",
            "points": 2
          },
          {
            "question": "What is A/B testing?",
            "type": "multiple-choice",
            "options": ["Testing two users", "Comparing two versions to determine which performs better", "Alpha and beta testing", "Two-phase testing"],
            "correctAnswer": "Comparing two versions to determine which performs better",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a design system?",
            "type": "multiple-choice",
            "options": ["Design software", "Collection of reusable components and standards", "Operating system", "Design process"],
            "correctAnswer": "Collection of reusable components and standards",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is accessibility in UX design?",
            "type": "multiple-choice",
            "options": ["Easy to find", "Designing for users with disabilities", "Website speed", "Mobile access"],
            "correctAnswer": "Designing for users with disabilities",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "True or False: Good UX design is invisible to users.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is WCAG?",
            "type": "multiple-choice",
            "options": ["Web Color and Graphics", "Web Content Accessibility Guidelines", "Website Creation and Guidelines", "Web Coding and Graphics"],
            "correctAnswer": "Web Content Accessibility Guidelines",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is heuristic evaluation?",
            "type": "multiple-choice",
            "options": ["Random evaluation", "Usability inspection method based on established principles", "Automatic evaluation", "User survey"],
            "correctAnswer": "Usability inspection method based on established principles",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is a call-to-action (CTA)?",
            "type": "multiple-choice",
            "options": ["Phone call", "Element prompting user to take specific action", "Action button", "User request"],
            "correctAnswer": "Element prompting user to take specific action",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is responsive design?",
            "type": "short-answer",
            "correctAnswer": "Design approach making interfaces adapt and respond to different screen sizes and devices",
            "difficulty": "easy",
            "points": 2
          },
          {
            "question": "What is the F-pattern in web design?",
            "type": "multiple-choice",
            "options": ["Font pattern", "Common eye-tracking pattern users follow when scanning content", "Failure pattern", "Frame pattern"],
            "correctAnswer": "Common eye-tracking pattern users follow when scanning content",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "What is micro-interaction?",
            "type": "multiple-choice",
            "options": ["Small user base", "Small animated feedback for user actions", "Minor feature", "Brief interaction"],
            "correctAnswer": "Small animated feedback for user actions",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is card sorting in UX research?",
            "type": "multiple-choice",
            "options": ["Organizing cards", "Method where users group content into categories", "Sorting algorithm", "Card game"],
            "correctAnswer": "Method where users group content into categories",
            "difficulty": "hard",
            "points": 1
          },
          {
            "question": "True or False: Mobile-first design means designing for mobile devices before desktop.",
            "type": "true-false",
            "correctAnswer": "true",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is Fitts's Law?",
            "type": "multiple-choice",
            "options": ["Fitness requirement", "Time to acquire target depends on distance and size", "Design law", "Layout rule"],
            "correctAnswer": "Time to acquire target depends on distance and size",
            "difficulty": "hard",
            "points": 1
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "Classical Mechanics",
    "quizzes": [
      {
        "title": "Newton's Laws and Motion",
        "description": "Fundamental principles of classical mechanics",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What is Newton's First Law of Motion?",
            "type": "multiple-choice",
            "options": ["F = ma", "An object at rest stays at rest unless acted upon by force", "Action equals reaction", "Energy is conserved"],
            "correctAnswer": "An object at rest stays at rest unless acted upon by force",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is Newton's Second Law?",
            "type": "multiple-choice",
            "options": ["F = ma", "An object at rest stays at rest unless acted upon by force", "Action equals reaction", "Energy is conserved"],
            "correctAnswer": "F = ma",
            "difficulty": "easy",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "Data Structures and Algorithms",
    "quizzes": [
      {
        "title": "Introduction to Data Structures",
        "description": "Test your knowledge of fundamental data structures",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What is the time complexity of accessing an element in an array by index?",
            "type": "multiple-choice",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
            "correctAnswer": "O(1)",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which data structure follows Last In First Out (LIFO) principle?",
            "type": "multiple-choice",
            "options": ["Queue", "Stack", "Array", "Linked List"],
            "correctAnswer": "Stack",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the worst-case time complexity of quicksort?",
            "type": "multiple-choice",
            "options": ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
            "correctAnswer": "O(n^2)",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "Which of the following is NOT a type of tree traversal?",
            "type": "multiple-choice",
            "options": ["Inorder", "Preorder", "Postorder", "Levelorder"],
            "correctAnswer": "Levelorder",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What does BFS stand for in graph algorithms?",
            "type": "multiple-choice",
            "options": ["Best First Search", "Breadth First Search", "Binary First Search", "Basic First Search"],
            "correctAnswer": "Breadth First Search",
            "difficulty": "easy",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "Machine Learning",
    "quizzes": [
      {
        "title": "Machine Learning Basics",
        "description": "Test your understanding of machine learning fundamentals",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 30,
        "questions": [
          {
            "question": "What is the main difference between supervised and unsupervised learning?",
            "type": "multiple-choice",
            "options": ["Supervised uses labeled data, unsupervised does not", "Supervised is faster, unsupervised is slower", "Supervised works with images, unsupervised with text", "Supervised requires more data"],
            "correctAnswer": "Supervised uses labeled data, unsupervised does not",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which algorithm is used for classification problems?",
            "type": "multiple-choice",
            "options": ["Linear Regression", "Logistic Regression", "K-Means", "PCA"],
            "correctAnswer": "Logistic Regression",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does overfitting mean in machine learning?",
            "type": "multiple-choice",
            "options": ["Model performs well on training data but poorly on new data", "Model performs poorly on training data", "Model takes too long to train", "Model uses too many features"],
            "correctAnswer": "Model performs well on training data but poorly on new data",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "Which of the following is a clustering algorithm?",
            "type": "multiple-choice",
            "options": ["Decision Tree", "K-Means", "SVM", "Neural Network"],
            "correctAnswer": "K-Means",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the purpose of cross-validation?",
            "type": "multiple-choice",
            "options": ["To train the model faster", "To evaluate model performance on unseen data", "To reduce model complexity", "To increase model accuracy"],
            "correctAnswer": "To evaluate model performance on unseen data",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "Cybersecurity",
    "quizzes": [
      {
        "title": "Cybersecurity Fundamentals",
        "description": "Test your knowledge of basic cybersecurity concepts",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What is the primary goal of cybersecurity?",
            "type": "multiple-choice",
            "options": ["To create viruses", "To protect systems from threats", "To hack into systems", "To monitor internet traffic"],
            "correctAnswer": "To protect systems from threats",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which of the following is a common type of malware?",
            "type": "multiple-choice",
            "options": ["Firewall", "Antivirus", "Trojan Horse", "Encryption"],
            "correctAnswer": "Trojan Horse",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does 'phishing' refer to?",
            "type": "multiple-choice",
            "options": ["A type of encryption", "A social engineering attack", "A firewall technique", "A password cracking method"],
            "correctAnswer": "A social engineering attack",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which protocol is used for secure web browsing?",
            "type": "multiple-choice",
            "options": ["HTTP", "FTP", "HTTPS", "SMTP"],
            "correctAnswer": "HTTPS",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a 'zero-day' vulnerability?",
            "type": "multiple-choice",
            "options": ["A vulnerability known for zero days", "A vulnerability with no known fix", "A vulnerability that takes zero time to exploit", "A vulnerability in zero-trust models"],
            "correctAnswer": "A vulnerability with no known fix",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "Cloud Computing",
    "quizzes": [
      {
        "title": "Cloud Computing Basics",
        "description": "Test your understanding of cloud computing concepts",
        "difficulty": "easy",
        "level": "beginner",
        "duration": 20,
        "questions": [
          {
            "question": "What does IaaS stand for?",
            "type": "multiple-choice",
            "options": ["Internet as a Service", "Infrastructure as a Service", "Information as a Service", "Integration as a Service"],
            "correctAnswer": "Infrastructure as a Service",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which cloud deployment model is exclusively for one organization?",
            "type": "multiple-choice",
            "options": ["Public Cloud", "Private Cloud", "Hybrid Cloud", "Community Cloud"],
            "correctAnswer": "Private Cloud",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the main advantage of cloud computing?",
            "type": "multiple-choice",
            "options": ["Higher security", "Scalability and flexibility", "Lower costs always", "No need for internet"],
            "correctAnswer": "Scalability and flexibility",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which service provides virtual machines in the cloud?",
            "type": "multiple-choice",
            "options": ["PaaS", "SaaS", "IaaS", "FaaS"],
            "correctAnswer": "IaaS",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does SaaS stand for?",
            "type": "multiple-choice",
            "options": ["Software as a Service", "Security as a Service", "Storage as a Service", "System as a Service"],
            "correctAnswer": "Software as a Service",
            "difficulty": "easy",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "Mobile App Development",
    "quizzes": [
      {
        "title": "Mobile Development Fundamentals",
        "description": "Test your knowledge of mobile app development basics",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "Which programming language is primarily used for Android development?",
            "type": "multiple-choice",
            "options": ["Swift", "Kotlin", "Objective-C", "JavaScript"],
            "correctAnswer": "Kotlin",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the main programming language for iOS development?",
            "type": "multiple-choice",
            "options": ["Java", "Kotlin", "Swift", "Python"],
            "correctAnswer": "Swift",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which framework is commonly used for cross-platform mobile development?",
            "type": "multiple-choice",
            "options": ["Django", "React Native", "Laravel", "Spring"],
            "correctAnswer": "React Native",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does API stand for in mobile app development?",
            "type": "multiple-choice",
            "options": ["Application Programming Interface", "Advanced Programming Interface", "Application Process Integration", "Automated Programming Interface"],
            "correctAnswer": "Application Programming Interface",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which component is used to display a list of items in Android?",
            "type": "multiple-choice",
            "options": ["TextView", "RecyclerView", "ImageView", "Button"],
            "correctAnswer": "RecyclerView",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "DevOps",
    "quizzes": [
      {
        "title": "DevOps Principles",
        "description": "Test your understanding of DevOps practices and tools",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What does CI/CD stand for?",
            "type": "multiple-choice",
            "options": ["Continuous Integration/Continuous Deployment", "Code Integration/Code Deployment", "Continuous Improvement/Continuous Development", "Code Inspection/Code Debugging"],
            "correctAnswer": "Continuous Integration/Continuous Deployment",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which tool is commonly used for version control in DevOps?",
            "type": "multiple-choice",
            "options": ["Jenkins", "Git", "Docker", "Kubernetes"],
            "correctAnswer": "Git",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the purpose of containerization in DevOps?",
            "type": "multiple-choice",
            "options": ["To store data", "To package applications with dependencies", "To monitor performance", "To manage networks"],
            "correctAnswer": "To package applications with dependencies",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which tool is used for container orchestration?",
            "type": "multiple-choice",
            "options": ["Docker", "Jenkins", "Kubernetes", "GitLab"],
            "correctAnswer": "Kubernetes",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is Infrastructure as Code (IaC)?",
            "type": "multiple-choice",
            "options": ["Writing code to manage infrastructure", "Coding applications for infrastructure", "Testing infrastructure manually", "Monitoring infrastructure performance"],
            "correctAnswer": "Writing code to manage infrastructure",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "Blockchain Technology",
    "quizzes": [
      {
        "title": "Blockchain Fundamentals",
        "description": "Test your knowledge of blockchain concepts",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What is a blockchain?",
            "type": "multiple-choice",
            "options": ["A type of database", "A distributed ledger technology", "A programming language", "A cloud service"],
            "correctAnswer": "A distributed ledger technology",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which cryptocurrency was the first to use blockchain?",
            "type": "multiple-choice",
            "options": ["Ethereum", "Bitcoin", "Litecoin", "Ripple"],
            "correctAnswer": "Bitcoin",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a smart contract?",
            "type": "multiple-choice",
            "options": ["A legal contract", "Self-executing code on blockchain", "A type of cryptocurrency", "A mining algorithm"],
            "correctAnswer": "Self-executing code on blockchain",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does 'decentralized' mean in blockchain context?",
            "type": "multiple-choice",
            "options": ["No central authority controls it", "It's faster than centralized systems", "It uses less energy", "It's cheaper to maintain"],
            "correctAnswer": "No central authority controls it",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which consensus mechanism does Bitcoin use?",
            "type": "multiple-choice",
            "options": ["Proof of Stake", "Proof of Work", "Proof of Authority", "Delegated Proof of Stake"],
            "correctAnswer": "Proof of Work",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "AI Fundamentals",
    "quizzes": [
      {
        "title": "Artificial Intelligence Basics",
        "description": "Test your understanding of AI concepts and applications",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What is artificial intelligence?",
            "type": "multiple-choice",
            "options": ["Machines performing tasks that typically require human intelligence", "A type of computer hardware", "A programming language", "A database system"],
            "correctAnswer": "Machines performing tasks that typically require human intelligence",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which of the following is a subfield of AI?",
            "type": "multiple-choice",
            "options": ["Machine Learning", "Database Management", "Network Security", "Web Development"],
            "correctAnswer": "Machine Learning",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is natural language processing (NLP)?",
            "type": "multiple-choice",
            "options": ["Processing natural languages like English", "Creating new programming languages", "Optimizing computer networks", "Designing user interfaces"],
            "correctAnswer": "Processing natural languages like English",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which AI technique involves learning from examples without explicit programming?",
            "type": "multiple-choice",
            "options": ["Rule-based systems", "Machine Learning", "Expert systems", "Algorithmic programming"],
            "correctAnswer": "Machine Learning",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is computer vision in AI?",
            "type": "multiple-choice",
            "options": ["AI understanding and interpreting visual information", "Creating 3D graphics", "Designing computer screens", "Developing video games"],
            "correctAnswer": "AI understanding and interpreting visual information",
            "difficulty": "easy",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "Software Engineering",
    "quizzes": [
      {
        "title": "Software Development Life Cycle",
        "description": "Test your knowledge of software engineering principles",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What is the first phase of the Software Development Life Cycle (SDLC)?",
            "type": "multiple-choice",
            "options": ["Design", "Planning", "Requirements Gathering", "Coding"],
            "correctAnswer": "Requirements Gathering",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which model emphasizes iterative development?",
            "type": "multiple-choice",
            "options": ["Waterfall", "Agile", "Spiral", "V-Model"],
            "correctAnswer": "Agile",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is unit testing?",
            "type": "multiple-choice",
            "options": ["Testing the entire system", "Testing individual components", "Testing user interfaces", "Testing performance"],
            "correctAnswer": "Testing individual components",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which design pattern provides a way to access elements of an aggregate object sequentially?",
            "type": "multiple-choice",
            "options": ["Singleton", "Observer", "Iterator", "Factory"],
            "correctAnswer": "Iterator",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is refactoring in software engineering?",
            "type": "multiple-choice",
            "options": ["Rewriting code from scratch", "Improving code structure without changing functionality", "Adding new features", "Fixing bugs"],
            "correctAnswer": "Improving code structure without changing functionality",
            "difficulty": "medium",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "Graphic Design Basics",
    "quizzes": [
      {
        "title": "Design Principles",
        "description": "Test your understanding of fundamental graphic design concepts",
        "difficulty": "easy",
        "level": "beginner",
        "duration": 20,
        "questions": [
          {
            "question": "What are the basic elements of design?",
            "type": "multiple-choice",
            "options": ["Line, shape, color, texture", "Font, size, layout", "Balance, contrast, emphasis", "Tools, software, techniques"],
            "correctAnswer": "Line, shape, color, texture",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does 'balance' refer to in design?",
            "type": "multiple-choice",
            "options": ["Using bright colors", "Equal distribution of visual weight", "Making text readable", "Creating movement"],
            "correctAnswer": "Equal distribution of visual weight",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which color model is used for digital displays?",
            "type": "multiple-choice",
            "options": ["CMYK", "RGB", "Pantone", "HSB"],
            "correctAnswer": "RGB",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is typography in graphic design?",
            "type": "multiple-choice",
            "options": ["Creating images", "Arranging typefaces", "Color selection", "Layout design"],
            "correctAnswer": "Arranging typefaces",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What does 'contrast' create in design?",
            "type": "multiple-choice",
            "options": ["Harmony", "Visual interest and hierarchy", "Confusion", "Balance"],
            "correctAnswer": "Visual interest and hierarchy",
            "difficulty": "easy",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "UI/UX Design",
    "quizzes": [
      {
        "title": "User Interface Design",
        "description": "Test your knowledge of UI/UX design principles",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "What does UX stand for?",
            "type": "multiple-choice",
            "options": ["User Experience", "User Extension", "Universal Experience", "User Experiment"],
            "correctAnswer": "User Experience",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which of the following is a key principle of good UI design?",
            "type": "multiple-choice",
            "options": ["Complexity", "Consistency", "Clutter", "Confusion"],
            "correctAnswer": "Consistency",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a wireframe in design?",
            "type": "multiple-choice",
            "options": ["Final design with colors", "Low-fidelity layout sketch", "High-resolution mockup", "Interactive prototype"],
            "correctAnswer": "Low-fidelity layout sketch",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the purpose of user personas?",
            "type": "multiple-choice",
            "options": ["To create fictional user profiles", "To represent target users", "To design interfaces", "To test applications"],
            "correctAnswer": "To represent target users",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which tool is commonly used for UI/UX design?",
            "type": "multiple-choice",
            "options": ["Photoshop", "Figma", "Excel", "Word"],
            "correctAnswer": "Figma",
            "difficulty": "easy",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "Electromagnetism",
    "quizzes": [
      {
        "title": "Electric and Magnetic Fields",
        "description": "Test your understanding of electromagnetic principles",
        "difficulty": "hard",
        "level": "advanced",
        "duration": 30,
        "questions": [
          {
            "question": "What is Coulomb's law?",
            "type": "multiple-choice",
            "options": ["F = ma", "F = kq1q2/r²", "E = mc²", "V = IR"],
            "correctAnswer": "F = kq1q2/r²",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is the SI unit of electric field strength?",
            "type": "multiple-choice",
            "options": ["Volt", "Ampere", "Newton per Coulomb", "Tesla"],
            "correctAnswer": "Newton per Coulomb",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which law states that magnetic field lines form closed loops?",
            "type": "multiple-choice",
            "options": ["Ampere's law", "Gauss's law", "Faraday's law", "Biot-Savart law"],
            "correctAnswer": "Gauss's law",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is electromagnetic induction?",
            "type": "multiple-choice",
            "options": ["Creating electricity from magnetism", "Creating magnetism from electricity", "Both A and B", "Neither A nor B"],
            "correctAnswer": "Both A and B",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the speed of light in vacuum?",
            "type": "multiple-choice",
            "options": ["3 × 10^8 m/s", "3 × 10^6 m/s", "3 × 10^10 m/s", "3 × 10^4 m/s"],
            "correctAnswer": "3 × 10^8 m/s",
            "difficulty": "easy",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "Quantum Physics",
    "quizzes": [
      {
        "title": "Quantum Mechanics Fundamentals",
        "description": "Test your knowledge of quantum physics concepts",
        "difficulty": "hard",
        "level": "advanced",
        "duration": 30,
        "questions": [
          {
            "question": "What is the photoelectric effect?",
            "type": "multiple-choice",
            "options": ["Light behaving as particles", "Electrons jumping energy levels", "Wave-particle duality", "Quantum entanglement"],
            "correctAnswer": "Light behaving as particles",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is Planck's constant?",
            "type": "multiple-choice",
            "options": ["Speed of light", "Quantum of energy", "Electron mass", "Avogadro's number"],
            "correctAnswer": "Quantum of energy",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What principle states that it's impossible to know both position and momentum exactly?",
            "type": "multiple-choice",
            "options": ["Pauli exclusion", "Heisenberg uncertainty", "Bohr complementarity", "Superposition principle"],
            "correctAnswer": "Heisenberg uncertainty",
            "difficulty": "medium",
            "points": 1
          },
          {
            "question": "What is wave-particle duality?",
            "type": "multiple-choice",
            "options": ["Particles having wave properties", "Waves having particle properties", "Both A and B", "Neither A nor B"],
            "correctAnswer": "Both A and B",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is a qubit in quantum computing?",
            "type": "multiple-choice",
            "options": ["Quantum bit", "Quantum byte", "Quantum circuit", "Quantum gate"],
            "correctAnswer": "Quantum bit",
            "difficulty": "easy",
            "points": 1
          }
        ]
      }
    ]
  },

  {
    "courseTitle": "Victorian Literature",
    "quizzes": [
      {
        "title": "Victorian Era Writers and Themes",
        "description": "Test your understanding of Victorian literature",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "Who wrote 'Great Expectations'?",
            "type": "multiple-choice",
            "options": ["Charles Dickens", "Thomas Hardy", "George Eliot", "Elizabeth Gaskell"],
            "correctAnswer": "Charles Dickens",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What is the pen name of Mary Ann Evans?",
            "type": "multiple-choice",
            "options": ["George Eliot", "Elizabeth Barrett Browning", "Christina Rossetti", "Emily Bronte"],
            "correctAnswer": "George Eliot",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which novel features the character Heathcliff?",
            "type": "multiple-choice",
            "options": ["Jane Eyre", "Wuthering Heights", "Pride and Prejudice", "Middlemarch"],
            "correctAnswer": "Wuthering Heights",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What social issue is central to many Victorian novels?",
            "type": "multiple-choice",
            "options": ["Industrialization", "Class differences", "Both A and B", "War and peace"],
            "correctAnswer": "Both A and B",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Who wrote 'Tess of the d'Urbervilles'?",
            "type": "multiple-choice",
            "options": ["Thomas Hardy", "Charles Dickens", "Anthony Trollope", "Wilkie Collins"],
            "correctAnswer": "Thomas Hardy",
            "difficulty": "easy",
            "points": 1
          }
        ]
      }
    ]
  }
,
  {
    "courseTitle": "Shakespearean Era",
    "quizzes": [
      {
        "title": "Shakespeare's Works and Context",
        "description": "Test your knowledge of Shakespeare and Elizabethan literature",
        "difficulty": "medium",
        "level": "intermediate",
        "duration": 25,
        "questions": [
          {
            "question": "In which year was William Shakespeare born?",
            "type": "multiple-choice",
            "options": ["1564", "1588", "1600", "1616"],
            "correctAnswer": "1564",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Which of these is NOT one of Shakespeare's tragedies?",
            "type": "multiple-choice",
            "options": ["Hamlet", "Macbeth", "Othello", "A Midsummer Night's Dream"],
            "correctAnswer": "A Midsummer Night's Dream",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What was the name of Shakespeare's theater?",
            "type": "multiple-choice",
            "options": ["Rose Theater", "Globe Theater", "Swan Theater", "Fortune Theater"],
            "correctAnswer": "Globe Theater",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "Who was the reigning monarch during most of Shakespeare's career?",
            "type": "multiple-choice",
            "options": ["Queen Elizabeth I", "King James I", "Queen Mary I", "King Henry VIII"],
            "correctAnswer": "Queen Elizabeth I",
            "difficulty": "easy",
            "points": 1
          },
          {
            "question": "What type of play is 'Twelfth Night'?",
            "type": "multiple-choice",
            "options": ["Tragedy", "Comedy", "History", "Romance"],
            "correctAnswer": "Comedy",
            "difficulty": "easy",
            "points": 1
          }
        ]
      }
    ]
  }
]


export { quizzesData };