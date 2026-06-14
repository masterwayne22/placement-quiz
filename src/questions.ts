import { Question } from "./types";

export const PLACEMENT_QUESTIONS: Question[] = [
  // --- Data Structures & Algorithms ---
  {
    id: 1,
    subject: "DSA",
    topic: "Dynamic Programming",
    difficulty: "Hard",
    questionText: "What is the worst-case space complexity of the iterative bottom-up Dynamic Programming approach for the 0/1 Knapsack problem with N items and a capacity of W, without any space optimization?",
    options: [
      "O(N)",
      "O(W)",
      "O(N * W)",
      "O(2^N)"
    ],
    correctOptionIndex: 2,
    codeSnippet: `// Standard 0/1 Knapsack State definition
int dp[N + 1][W + 1];
for (int i = 0; i <= N; i++) {
    for (int w = 0; w <= W; w++) {
        if (i == 0 || w == 0) dp[i][w] = 0;
        else if (wt[i-1] <= w) 
            dp[i][w] = max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w]);
        else 
            dp[i][w] = dp[i-1][w];
    }
}`,
    language: "cpp",
    explanation: "Without space optimization, the full recursion grid of size (N + 1) * (W + 1) is allocated to store computing states. Hence, the space complexity is O(N * W). Note that we can optimize this to O(W) space since each state calculation only requires values from the previous row."
  },
  {
    id: 2,
    subject: "DSA",
    topic: "Binary Trees",
    difficulty: "Medium",
    questionText: "Given the Preorder traversal of a Binary Search Tree (BST) is: [10, 5, 1, 7, 40, 50]. How many nodes will exist in the left subtree of the root?",
    options: [
      "2 nodes",
      "3 nodes",
      "4 nodes",
      "5 nodes"
    ],
    correctOptionIndex: 1,
    explanation: "In a BST, the first element of the preorder traversal is always the root (10). All elements smaller than the root belong to its left subtree, and all elements larger than the root belong to its right subtree. Comparing elements to 10: [5, 1, 7] are smaller, so they reside in its left subtree. Thus, there are exactly 3 nodes in the left subtree."
  },
  {
    id: 3,
    subject: "DSA",
    topic: "Sorting Algorithms",
    difficulty: "Medium",
    questionText: "Which sorting algorithm maintains the relative order of record keys with equal values (stability) and operates with O(1) auxiliary space?",
    options: [
      "Quick Sort",
      "Merge Sort",
      "Insertion Sort",
      "Heap Sort"
    ],
    correctOptionIndex: 2,
    explanation: "Insertion Sort is stable and operates in-place with O(1) auxiliary space complexity. Merge Sort is stable but demands O(N) auxiliary space. Quick Sort and Heap Sort are inherently unstable algorithms."
  },
  {
    id: 4,
    subject: "DSA",
    topic: "Graphs",
    difficulty: "Hard",
    questionText: "Consider a directed graph with negative weight edges but no negative weight cycles. Which algorithm should be deployed to find the shortest path from a single source node to all other nodes?",
    options: [
      "Dijkstra's Algorithm",
      "Bellman-Ford Algorithm",
      "Kruskal's Algorithm",
      "Floyd-Warshall Algorithm"
    ],
    correctOptionIndex: 1,
    explanation: "Bellman-Ford can handle graphs with negative weights (provided there are no negative cycles) and operates in O(V * E) time. Dijkstra's Algorithm will fail because once a vertex is marked 'visited/processed,' its shortest path estimate is locked, which negative edges can subsequently invalidate."
  },
  {
    id: 5,
    subject: "DSA",
    topic: "Arrays & Strings",
    difficulty: "Easy",
    questionText: "What is the time complexity to search for an element in a sorted rotated array using a modified Binary Search?",
    options: [
      "O(N)",
      "O(log N)",
      "O(N log N)",
      "O(1)"
    ],
    correctOptionIndex: 1,
    explanation: "A modified Binary Search splits the rotated sorted array into halves. At any point, at least one half must be completely sorted. By checking which side is sorted and comparing boundaries, we can discard half the search space in each iteration, preserving the O(log N) runtime."
  },

  // --- Operating Systems ---
  {
    id: 6,
    subject: "Operating Systems",
    topic: "Deadlocks",
    difficulty: "Medium",
    questionText: "Which of the following conditions is NOT a necessary requirement for a system to enter a deadlock state?",
    options: [
      "Mutual Exclusion",
      "No Preemption",
      "Circular Wait",
      "Preemptive Priority Scheduling"
    ],
    correctOptionIndex: 3,
    explanation: "The Coffman conditions required for a deadlock are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, and 4. Circular Wait. Preemptive priority scheduling is a process scheduling policy and plays no role in necessary conditions for deadlocks."
  },
  {
    id: 7,
    subject: "Operating Systems",
    topic: "Memory Management",
    difficulty: "Hard",
    questionText: "Consider a logical address space of 64 pages with a 4KB page size, mapped onto a physical memory of 32 frames. How many bits are required in the logical address and physical address respectively?",
    options: [
      "18 bits (Logical), 17 bits (Physical)",
      "16 bits (Logical), 15 bits (Physical)",
      "32 bits (Logical), 16 bits (Physical)",
      "14 bits (Logical), 12 bits (Physical)"
    ],
    correctOptionIndex: 0,
    codeSnippet: `Page Size = 4 KB = 2^12 bytes (Offset = 12 bits)
Logical Address Pages = 64 = 2^6 pages (Page No. = 6 bits)
Physical Address Frames = 32 = 2^5 frames (Frame No. = 5 bits)`,
    language: "text",
    explanation: "Logical address requires page index bits + offset bits. Page index: log2(64) = 6 bits. Offset: log2(4096) = 12 bits. Total = 18 bits. Physical address requires frame index bits + offset bits. Frame index: log2(32) = 5 bits. Offset: 12 bits. Total = 17 bits."
  },
  {
    id: 8,
    subject: "Operating Systems",
    topic: "CPU Scheduling",
    difficulty: "Medium",
    questionText: "Which CPU scheduling algorithm exhibits the 'Convoy Effect' where short processes queue behind long processes, hurting overall queue turnaround times?",
    options: [
      "Shortest Job First (SJF)",
      "Round Robin (RR)",
      "First-Come, First-Served (FCFS)",
      "Priority-Based Scheduling"
    ],
    correctOptionIndex: 2,
    explanation: "The Convoy Effect is characteristic of First-Come, First-Served (FCFS) scheduling. When a CPU-bound process with a huge burst time runs first, all shorter CPU/IO-bound processes must wait, clogging the CPU pipeline and inflating waiting times."
  },
  {
    id: 9,
    subject: "Operating Systems",
    topic: "Virtual Memory",
    difficulty: "Hard",
    questionText: "What is Belady's Anomaly in the context of page replacement algorithms?",
    options: [
      "The anomaly where increasing physical page frames leads to an unexpected increase in the number of page faults.",
      "The failure of virtual memory to address offsets beyond physical RAM limits.",
      "A condition where thrashing occurs only on multi-threaded preemptive kernels.",
      "The collision of multiple Page Table Entries (PTE) mapping physical frame index zero."
    ],
    correctOptionIndex: 0,
    explanation: "Belady's Anomaly describes a phenomenon in certain page replacement policies (such as FIFO) where allocating *more* physical page frames actually increases the total count of page faults for specific reference strings. Stack-based algorithms like LRU (Least Recently Used) are immune to this anomaly."
  },

  // --- Database Management Systems ---
  {
    id: 10,
    subject: "DBMS",
    topic: "SQL Queries",
    difficulty: "Medium",
    questionText: "Consider the SQL query below. What does this query return when executed on a relational database?",
    options: [
      "All active departments.",
      "Departments having fewer than 5 employees.",
      "Departments having strictly more than 5 employees.",
      "Departments with 5 or more employees."
    ],
    correctOptionIndex: 2,
    codeSnippet: `SELECT dept_id, COUNT(*) 
FROM employees 
GROUP BY dept_id 
HAVING COUNT(*) > 5;`,
    language: "sql",
    explanation: "The GROUP BY partitions employees by department ID, and the HAVING clause acts as a filter on the aggregate count, returning only departments with structural counts strictly greater than 5."
  },
  {
    id: 11,
    subject: "DBMS",
    topic: "Database Normalization",
    difficulty: "Hard",
    questionText: "A relation R(A, B, C, D) has the following functional dependencies: {A -> B, B -> C, C -> D, D -> A}. What is the highest database normal form satisfied by this relation?",
    options: [
      "1NF",
      "2NF",
      "3NF",
      "BCNF"
    ],
    correctOptionIndex: 3,
    explanation: "Every single attribute {A, B, C, D} is a candidate key because A -> B -> C -> D -> A (circular cycle). Since every single dependency's determinant (left side) is a superkey, the relation naturally satisfies Boyce-Codd Normal Form (BCNF), the strictest of the standard constraints."
  },
  {
    id: 12,
    subject: "DBMS",
    topic: "Transactions & Concurrency",
    difficulty: "Medium",
    questionText: "Which isolation level prevents 'Dirty Reads' but still permits non-repeatable reads and phantom reads within a database transaction?",
    options: [
      "Read Uncommitted",
      "Read Committed",
      "Repeatable Read",
      "Serializable"
    ],
    correctOptionIndex: 1,
    explanation: "Read Committed isolation ensures that any database query only views changes committed prior to the query runtime. It successfully prevents dirty reads, but leaves open vulnerabilities for 'Non-repeatable reads' and 'Phantom reads'."
  },

  // --- Computer Networks ---
  {
    id: 13,
    subject: "Computer Networks",
    topic: "IP Routing & Subnets",
    difficulty: "Hard",
    questionText: "An organization is allotted the Class C network address block 192.168.10.0/24. They need to divide it into exactly 4 subnets. What is the custom subnet mask and maximum host capacity of each subnet?",
    options: [
      "255.255.255.128, 126 hosts",
      "255.255.255.192, 62 hosts",
      "255.255.255.224, 30 hosts",
      "255.255.255.240, 14 hosts"
    ],
    correctOptionIndex: 1,
    codeSnippet: `Required Subnets = 4 => Need log2(4) = 2 bits from host section
Default Mask = /24. New Mask = /26 (255.255.255.192)
Available Host Bits = 8 - 2 = 6 bits
Max Host capacity = 2^6 - 2 = 62 hosts (subtracting Subnet & Broadcast)`,
    language: "text",
    explanation: "Borrowing 2 bits from the host portion of /24 gives a /26 prefix (mask of 255.255.255.192). This leaves 6 bits for hosts. 2^6 = 64 possible combinations. Subtracting 2 addresses (one for subnet identification, one for broadcast propagation) yields 62 valid user host addresses per subnet."
  },
  {
    id: 14,
    subject: "Computer Networks",
    topic: "OSI Layering",
    difficulty: "Easy",
    questionText: "Which layer of the OSI architecture Model handles data compression, string encryption, and syntax translations between hosts?",
    options: [
      "Application Layer",
      "Presentation Layer",
      "Session Layer",
      "Transport Layer"
    ],
    correctOptionIndex: 1,
    explanation: "The Presentation Layer functions as a data translator for the network. It manages syntax mapping, encryption details, data compression, and serialization from application formats to clean binary streams."
  },
  {
    id: 15,
    subject: "Computer Networks",
    topic: "TCP/IP Protocol Suite",
    difficulty: "Medium",
    questionText: "How does the TCP receiver notify the sender to temporarily stop sending data during peak network stress conditions?",
    options: [
      "It sends an ICMP Source Quench control packet.",
      "It flags the RST (Reset) parameter in the TCP packet header.",
      "It decreases the advertised Receiver Window (RWND) size to 0 in its ACKs.",
      "It drops all packet payloads to trigger quick triple duplicate ACKs."
    ],
    correctOptionIndex: 2,
    explanation: "TCP flow control is governed by the sliding receiver window. By setting the advertised RWND (Receiver Window) field to 0 in returning ACK frames, the receiver establishes a 'Zero Window' state, preventing the sender from initiating further transmissions until buffer memory frees up."
  },

  // --- OOPs & System Design ---
  {
    id: 16,
    subject: "OOPs & System Design",
    topic: "Polymorphism & Binding",
    difficulty: "Medium",
    questionText: "What mechanism is used at runtime in Java to determine which overridden method to execute on a base reference point?",
    options: [
      "Static Binding using the Linker",
      "Virtual Method Table (Vtable) lookup",
      "Compile-time macro expansion",
      "Just-in-Time Register allocation"
    ],
    correctOptionIndex: 1,
    codeSnippet: `class Animal { void speak() { System.out.println("Noisy"); } }
class Dog extends Animal { void speak() { System.out.println("Bark"); } }

Animal myPet = new Dog();
myPet.speak(); // Which speak() is invoked?`,
    language: "java",
    explanation: "Dynamic Method Dispatch or Runtime Polymorphism is resolved via class Vtables (Virtual Method Tables). Each object carries an internal reference pointer to its class vtable which points directly to compiled overridden routines at runtime."
  },
  {
    id: 17,
    subject: "OOPs & System Design",
    topic: "Clean Architecture",
    difficulty: "Hard",
    questionText: "The 'Dependency Inversion Principle' in SOLID design mandates that:",
    options: [
      "Subclasses must be completely substitutable for their superclasses.",
      "High-level modules should not import anything from low-level modules; both should depend on abstractions.",
      "Software entities should be open for extension but closed for modification.",
      "Single classes must handle a unified operational responsibility."
    ],
    correctOptionIndex: 1,
    explanation: "Dependency Inversion states: 1. High-level modules should not depend on low-level modules; both should depend on abstractions. 2. Abstractions should not depend on details; details should depend on abstractions. This decouple layers for clean components."
  },
  {
    id: 18,
    subject: "OOPs & System Design",
    topic: "Design Patterns",
    difficulty: "Medium",
    questionText: "Which design pattern is best suited for scenarios where multiple objects must receive reactive state updates when a subject's state properties change?",
    options: [
      "Factory Pattern",
      "Observer Pattern",
      "Decorator Pattern",
      "Adapter Pattern"
    ],
    correctOptionIndex: 1,
    explanation: "The Observer Pattern defines a clear one-to-many dependency topology. Whenever the subject object experiences state modifications, all subscribed observer hooks are automatically notified of updates."
  },

  // --- Miscellaneous Core CS / Placement Special ---
  {
    id: 19,
    subject: "DSA",
    topic: "Sorting Complexities",
    difficulty: "Easy",
    questionText: "What is the lower bound on the time complexity of any comparison-based sorting algorithm in the worst case?",
    options: [
      "O(N)",
      "O(N log N)",
      "O(N^2)",
      "O(2^N)"
    ],
    correctOptionIndex: 1,
    explanation: "Any comparison-based sorting algorithm can be represented as a decision tree with N! leaf nodes representing sorted indices. The minimum depth of an optimal binary tree with N! leaf outputs is log2(N!) which, by Stirling's Approximation, is bounded by Ω(N log N)."
  },
  {
    id: 20,
    subject: "DBMS",
    topic: "Relational Algebra",
    difficulty: "Hard",
    questionText: "In Relational Algebra, which operation acts as a set-theoretic filter that yields rows matching predicate controls? (Represented by the lowercase Greek symbol Sigma σ)",
    options: [
      "Projection",
      "Selection",
      "Join",
      "Intersection"
    ],
    correctOptionIndex: 1,
    explanation: "Selection (σ) is a unary operation that returns rows matching the specific predicate check. Projection (π) is the unary operation that selects columns. Do not confuse Relational Algebra 'Selection' (which filters rows) with SQL SELECT (which typically projects columns)."
  }
];

export const SUBJECTS_LIST = [
  {
    id: "all",
    name: "Complete Mock Test",
    icon: "GraduationCap",
    description: "Full-syllabus placement exam simulation spanning all primary CS fields under timed conditions.",
    questionCount: PLACEMENT_QUESTIONS.length,
    featuredTopic: "All subjects mix"
  },
  {
    id: "DSA",
    name: "Data Structures & Algorithms",
    icon: "Binary",
    description: "Complexity bounds, Trees, Graphs, Sorting routines, Dynamic Programming, and Array operations.",
    questionCount: PLACEMENT_QUESTIONS.filter(q => q.subject === "DSA").length,
    featuredTopic: "DP, Trees, Complexity"
  },
  {
    id: "Operating Systems",
    name: "Operating Systems",
    icon: "Cpu",
    description: "Deadlocks, CPU Scheduling priority, Logical memory architectures, paging offset, page replacement rules.",
    questionCount: PLACEMENT_QUESTIONS.filter(q => q.subject === "Operating Systems").length,
    featuredTopic: "Virtual Memory, Paging"
  },
  {
    id: "DBMS",
    name: "Database Systems (DBMS)",
    icon: "Database",
    description: "SQL query aggregation, relation keys, normal forms (1NF-BCNF), and transaction isolation levels.",
    questionCount: PLACEMENT_QUESTIONS.filter(q => q.subject === "DBMS").length,
    featuredTopic: "Normal Forms, SQL"
  },
  {
    id: "Computer Networks",
    name: "Computer Networks",
    icon: "Network",
    description: "Subnet masks calculators, TCP congestion controls, Receiver window flow rate, OSI physical representations.",
    questionCount: PLACEMENT_QUESTIONS.filter(q => q.subject === "Computer Networks").length,
    featuredTopic: "IP Addressing, TCP flow"
  },
  {
    id: "OOPs & System Design",
    name: "OOPs & System Design",
    icon: "Puzzle",
    description: "Dynamic method dispatch mechanisms, virtual function tables, SOLID components, design patterns.",
    questionCount: PLACEMENT_QUESTIONS.filter(q => q.subject === "OOPs & System Design").length,
    featuredTopic: "SOLID, Design Patterns"
  }
];
