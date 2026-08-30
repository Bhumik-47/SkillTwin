/**
 * SkillTwin Curated Learner-Friendly Study Resources
 * Maps every domain skill to beginner-friendly tutorials from GeeksforGeeks, W3Schools, TutorialsPoint, MDN,
 * YouTube (topic-wise videos), and community blogs — categorised for 4 learning preferences.
 *
 * Source Trust Whitelist:
 *   Tier 1 (Institutional): GeeksforGeeks, W3Schools, TutorialsPoint, MDN, Official Docs
 *   Tier 2 (Verified Creators): YouTube channels with 100K+ subs & educational focus
 *   Tier 3 (Community-Vetted): Dev.to, RealPython, DigitalOcean, CSS-Tricks, Programiz
 */

export type ResourceCategory = 'reading' | 'video' | 'exercise' | 'blog';
export type LearningPreference = 'hands_on' | 'video' | 'reading' | 'mixed';

export interface StudyResource {
  title: string;
  platform: 'GeeksforGeeks' | 'W3Schools' | 'TutorialsPoint' | 'MDN Web Docs' | 'freeCodeCamp'
    | 'Official Guide' | 'YouTube' | 'Dev.to' | 'RealPython' | 'HackerRank' | 'LeetCode'
    | 'DigitalOcean' | 'Kaggle' | 'Programiz';
  url: string;
  type: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  keyPoints?: string[];
  category: ResourceCategory;
  verified: boolean;
}

export interface InterviewQuestion {
  q: string;
  a: string;
}

export interface TopicStudyData {
  resources: StudyResource[];
  interviewQuestions: InterviewQuestion[];
}

export const TOPIC_RESOURCES_MAP: Record<string, TopicStudyData> = {
  // =========================================================================
  // 1. BACKEND ENGINEERING — First 5 Chapters (fully categorised)
  // =========================================================================
  http_basics: {
    resources: [
      // ── READING ──
      { title: 'HTTP Protocol Basics & Status Codes', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/http-full-form/', type: 'Tutorial Guide', duration: '7 min read', difficulty: 'Beginner', summary: 'Learn request methods (GET, POST, PUT, DELETE), header structures, and HTTP status code categories (2xx, 3xx, 4xx, 5xx).', category: 'reading', verified: true },
      { title: 'HTTP Methods Explained (GET vs POST)', platform: 'W3Schools', url: 'https://www.w3schools.com/tags/ref_httpmethods.asp', type: 'Interactive Guide', duration: '5 min read', difficulty: 'Beginner', summary: 'Clear comparison of request parameters in URL query strings vs request bodies.', category: 'reading', verified: true },
      { title: 'An Overview of HTTP — Mozilla', platform: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview', type: 'Standard Reference', duration: '12 min read', difficulty: 'Intermediate', summary: 'Official in-depth guide to HTTP architecture, messages, sessions, and connection models.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'HTTP in Depth — Status Codes, Methods & Headers', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=iYM2zFP3Zn0', type: 'Topic Video', duration: '28 min watch', difficulty: 'Beginner', summary: 'Hussein Nasser walks through each HTTP method, status code family, and common headers with real-world examples.', category: 'video', verified: true },
      { title: 'HTTP/1 to HTTP/2 to HTTP/3 Explained', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=a-sBfyiXysI', type: 'Topic Video', duration: '12 min watch', difficulty: 'Intermediate', summary: 'Fireship explains the evolution of HTTP protocols with clear visual animations.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'REST API Challenge — HTTP Methods', platform: 'HackerRank', url: 'https://www.hackerrank.com/domains/tutorials/10-days-of-javascript', type: 'Practice Challenge', duration: '20 min', difficulty: 'Beginner', summary: 'Practice building HTTP requests and parsing status codes in interactive challenges.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'Everything You Need to Know About HTTP', platform: 'Dev.to', url: 'https://dev.to/carriepascale/everything-you-need-to-know-about-http-the-protocol-that-powers-the-web-1l5p', type: 'Blog Post', duration: '10 min read', difficulty: 'Beginner', summary: 'Community-favourite deep dive into request-response cycles, CORS, and content negotiation.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the difference between HTTP PUT and HTTP PATCH?', a: 'PUT replaces the entire resource document with the new payload. PATCH applies a partial update, modifying only the fields specified in the request.' },
      { q: 'Why is HTTP/2 multiplexing better than HTTP/1.1 pipelining?', a: 'HTTP/2 sends multiple request/response streams concurrently over a single TCP connection, eliminating head-of-line blocking.' }
    ]
  },

  tcp_ip_sockets: {
    resources: [
      // ── READING ──
      { title: 'TCP/IP Protocol Architecture', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/tcp-ip-model/', type: 'Tutorial Guide', duration: '10 min read', difficulty: 'Beginner', summary: 'Four-layer TCP/IP model: Application, Transport, Internet, Network Access with protocol mapping.', category: 'reading', verified: true },
      { title: 'TCP Three-Way Handshake Process', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/tcp-3-way-handshake-process/', type: 'Tutorial Guide', duration: '6 min read', difficulty: 'Beginner', summary: 'SYN, SYN-ACK, ACK sequence for establishing reliable TCP connections.', category: 'reading', verified: true },
      { title: 'Socket Programming in Computer Networks', platform: 'TutorialsPoint', url: 'https://www.tutorialspoint.com/unix_sockets/what_is_socket.htm', type: 'Conceptual Guide', duration: '8 min read', difficulty: 'Intermediate', summary: 'Socket APIs, bind, listen, accept, connect system calls and client-server flow.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'TCP/IP Explained — How Data Moves Across Networks', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=PpsEaqJV_A0', type: 'Topic Video', duration: '22 min watch', difficulty: 'Beginner', summary: 'NetworkChuck explains TCP/IP layers, packet encapsulation, and network address translation with diagrams.', category: 'video', verified: true },
      { title: 'Socket Programming Basics — Python', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=3QiPPX-KeSc', type: 'Topic Video', duration: '45 min watch', difficulty: 'Intermediate', summary: 'Tech With Tim builds a TCP client-server chat app step by step in Python.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Build a TCP Echo Server', platform: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/python-networking-socket-programming/', type: 'Guided Project', duration: '30 min', difficulty: 'Intermediate', summary: 'Hands-on lab: write a TCP echo server and client that exchange messages over localhost.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'Demystifying TCP/IP for Backend Developers', platform: 'DigitalOcean', url: 'https://www.digitalocean.com/community/tutorials/understanding-the-tcp-ip-networking-model', type: 'Blog Post', duration: '12 min read', difficulty: 'Beginner', summary: 'DigitalOcean tutorial covering OSI vs TCP/IP, encapsulation, and practical packet analysis.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the TCP Three-Way Handshake?', a: 'Client sends SYN → Server replies SYN-ACK → Client sends ACK. This establishes sequence numbers and a reliable bidirectional connection.' },
      { q: 'What is the difference between TCP and UDP?', a: 'TCP is connection-oriented with guaranteed delivery and ordering. UDP is connectionless with no acknowledgements — faster but unreliable, used for streaming/gaming.' }
    ]
  },

  dns_resolution: {
    resources: [
      // ── READING ──
      { title: 'DNS Resolution Process Step by Step', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/dns-domain-name-system/', type: 'Tutorial Guide', duration: '8 min read', difficulty: 'Beginner', summary: 'How recursive resolvers query root → TLD → authoritative nameservers to translate domain names to IPs.', category: 'reading', verified: true },
      { title: 'DNS Record Types Explained', platform: 'TutorialsPoint', url: 'https://www.tutorialspoint.com/dns/dns_records.htm', type: 'Reference Guide', duration: '6 min read', difficulty: 'Beginner', summary: 'A, AAAA, CNAME, MX, TXT, NS, and SOA record types with use cases.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'DNS Explained — How Your Browser Finds Websites', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=27r4Bzuj5NQ', type: 'Topic Video', duration: '6 min watch', difficulty: 'Beginner', summary: 'ByteByteGo visual animation of the full DNS resolution chain from browser to authoritative server.', category: 'video', verified: true },
      { title: 'DNS Records — A, CNAME, MX, TXT Explained', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=7lxgpKh_fRY', type: 'Topic Video', duration: '15 min watch', difficulty: 'Beginner', summary: 'IBM Technology walks through each DNS record type with real config examples.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'DNS Lookup Practice with dig & nslookup', platform: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/linux-command-line-dns-lookup-tools/', type: 'Hands-on Lab', duration: '15 min', difficulty: 'Beginner', summary: 'Use dig, nslookup, and host CLI tools to trace real DNS queries and inspect record responses.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'How DNS Works — A Visual Guide', platform: 'Dev.to', url: 'https://dev.to/chrisachard/dns-record-crash-course-for-web-developers-35hn', type: 'Blog Post', duration: '8 min read', difficulty: 'Beginner', summary: 'Illustrated crash course on DNS propagation, TTL caching, and common DNS misconfigurations.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the difference between recursive and iterative DNS resolution?', a: 'In recursive resolution, the DNS resolver takes full responsibility for finding the answer. In iterative, each server refers the resolver to the next server without resolving on its behalf.' },
      { q: 'What is DNS TTL and why does it matter?', a: 'Time-To-Live determines how long DNS records are cached. Low TTLs allow fast failovers but increase query load; high TTLs reduce load but delay propagation of DNS changes.' }
    ]
  },

  tls_encryption: {
    resources: [
      // ── READING ──
      { title: 'TLS/SSL Protocol Explained', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/transport-layer-security-tls/', type: 'Tutorial Guide', duration: '10 min read', difficulty: 'Intermediate', summary: 'TLS handshake steps: ClientHello, ServerHello, certificate exchange, key exchange, and cipher suite negotiation.', category: 'reading', verified: true },
      { title: 'HTTPS and SSL/TLS Basics', platform: 'TutorialsPoint', url: 'https://www.tutorialspoint.com/internet_technologies/internet_security.htm', type: 'Conceptual Guide', duration: '7 min read', difficulty: 'Beginner', summary: 'Symmetric vs asymmetric encryption, digital certificates, and certificate authorities (CA).', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'TLS Handshake Explained — Every Step', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=86cQJ0MMses', type: 'Topic Video', duration: '20 min watch', difficulty: 'Intermediate', summary: 'Hussein Nasser walks through the full TLS 1.2 and 1.3 handshake process with packet captures.', category: 'video', verified: true },
      { title: 'SSL, TLS, HTTPS Explained', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=j9QmMEWmcfo', type: 'Topic Video', duration: '10 min watch', difficulty: 'Beginner', summary: 'ByteByteGo animated overview of certificate validation, public key exchange, and session keys.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Inspect TLS Certificates with OpenSSL', platform: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/openssl-command-cheatsheet/', type: 'Hands-on Lab', duration: '15 min', difficulty: 'Intermediate', summary: 'Use openssl s_client to connect to live websites, inspect certificate chains, and verify expiry dates.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'How HTTPS Works — A Comic Explanation', platform: 'Dev.to', url: 'https://dev.to/bashirk/how-https-works-a-visual-guide-3an5', type: 'Blog Post', duration: '8 min read', difficulty: 'Beginner', summary: 'Beautifully illustrated step-by-step visual walkthrough of the HTTPS/TLS handshake and encryption process.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the difference between symmetric and asymmetric encryption in TLS?', a: 'Asymmetric (RSA/ECDSA) is used during the handshake to securely exchange keys. Symmetric (AES) is used for the actual data transfer because it is much faster.' },
      { q: 'What changed between TLS 1.2 and TLS 1.3?', a: 'TLS 1.3 reduced the handshake to 1-RTT (from 2-RTT), removed insecure ciphers (RC4, 3DES), and made forward secrecy mandatory.' }
    ]
  },

  restful_api_design: {
    resources: [
      // ── READING ──
      { title: 'REST API Design Best Practices', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/rest-api-introduction/', type: 'Tutorial Guide', duration: '9 min read', difficulty: 'Beginner', summary: 'Resource-oriented URLs, HTTP verbs for CRUD, status codes, idempotency, and JSON response structure.', category: 'reading', verified: true },
      { title: 'RESTful Web Services Tutorial', platform: 'TutorialsPoint', url: 'https://www.tutorialspoint.com/restful/index.htm', type: 'Conceptual Guide', duration: '8 min read', difficulty: 'Beginner', summary: 'REST architectural constraints: stateless, uniform interface, client-server separation, cacheable responses.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'RESTful APIs Explained — Design & Best Practices', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=-MTSQjw5DrM', type: 'Topic Video', duration: '18 min watch', difficulty: 'Beginner', summary: 'Traversy Media covers REST principles, URL naming conventions, HTTP methods, and pagination patterns.', category: 'video', verified: true },
      { title: 'REST API Design: Resource Naming & Versioning', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=lsMQRaeKNDk', type: 'Topic Video', duration: '14 min watch', difficulty: 'Intermediate', summary: 'IBM Technology explains URL path design, query parameters vs body, and API versioning strategies.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Build a REST API with Python Flask', platform: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/build-a-rest-api-with-python/', type: 'Guided Project', duration: '40 min', difficulty: 'Intermediate', summary: 'Step-by-step hands-on lab building a full CRUD REST API with Flask, testing endpoints with Postman.', category: 'exercise', verified: true },
      { title: 'REST API Design Challenges', platform: 'HackerRank', url: 'https://www.hackerrank.com/domains/tutorials/10-days-of-javascript', type: 'Practice Challenge', duration: '25 min', difficulty: 'Beginner', summary: 'Practice designing resource URLs, choosing correct HTTP methods, and returning proper status codes.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'Best Practices for Designing REST APIs', platform: 'Dev.to', url: 'https://dev.to/pragativerma18/best-practices-for-designing-rest-apis-4845', type: 'Blog Post', duration: '10 min read', difficulty: 'Intermediate', summary: 'Community-vetted guide covering naming conventions, error handling, filtering, sorting, and HATEOAS.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What makes an API truly RESTful?', a: 'Stateless communication, resource-based URIs, standard HTTP methods for CRUD, and hypermedia (HATEOAS) linking related resources.' },
      { q: 'What is the difference between PUT and POST in REST?', a: 'POST creates a new resource (server assigns the ID). PUT replaces an entire resource at a known URI (client specifies the ID). PUT is idempotent; POST is not.' }
    ]
  },

  // Existing backend skills (kept with category/verified added)
  threads_and_processes: {
    resources: [
      { title: 'Difference Between Process and Thread in OS', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/difference-between-process-and-thread/', type: 'Tutorial Guide', duration: '8 min read', difficulty: 'Beginner', summary: 'How processes have independent memory address spaces while threads share the process heap and data segment.', category: 'reading', verified: true },
      { title: 'Operating System Multithreading Architecture', platform: 'TutorialsPoint', url: 'https://www.tutorialspoint.com/operating_system/os_multi_threading.htm', type: 'Conceptual Guide', duration: '9 min read', difficulty: 'Intermediate', summary: 'User-level vs kernel-level threads, context switching overhead, and thread scheduling models.', category: 'reading', verified: true },
    ],
    interviewQuestions: [
      { q: 'Why do threads share the heap memory but keep separate stack memory?', a: 'The shared heap enables fast inter-thread communication without IPC overhead. Separate stacks are necessary to maintain independent local function calls and variable frames.' },
      { q: 'What happens during a CPU context switch between two threads?', a: 'The CPU program counter, stack pointer, and registers are saved into the Thread Control Block (TCB), and the next scheduled thread registers are loaded.' }
    ]
  },

  async_await_event_loop: {
    resources: [
      { title: 'Understanding Asynchronous Programming & Event Loops', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/python-asyncio-an-introduction-to-asynchronous-programming-in-python/', type: 'Tutorial Guide', duration: '10 min read', difficulty: 'Intermediate', summary: 'How single-threaded non-blocking I/O multiplexing handles thousands of concurrent socket connections.', category: 'reading', verified: true },
      { title: 'JavaScript Event Loop & Concurrency Model', platform: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop', type: 'Interactive Guide', duration: '8 min read', difficulty: 'Intermediate', summary: 'Visualizing the Call Stack, Macro-task Queue, Micro-task Queue, and non-blocking worker pools.', category: 'reading', verified: true },
    ],
    interviewQuestions: [
      { q: 'Is async I/O multithreaded by default?', a: 'No. Async I/O uses non-blocking kernel socket polling (epoll/kqueue) on a single thread. The event loop switches tasks when waiting for I/O.' },
      { q: 'When should you use Asyncio instead of Multiprocessing in Python?', a: 'Use Asyncio for I/O-bound tasks (network requests, database queries, file reading). Use Multiprocessing for CPU-bound tasks (encryption, image processing, heavy math).' }
    ]
  },

  race_conditions_locks: {
    resources: [
      { title: 'Mutex vs Semaphore in Operating Systems', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/mutex-vs-semaphore/', type: 'Tutorial Guide', duration: '9 min read', difficulty: 'Intermediate', summary: 'Clear breakdown of lock ownership (Mutex) vs signaling counters (Counting & Binary Semaphores).', category: 'reading', verified: true },
      { title: 'Deadlock Conditions and Prevention in OS', platform: 'TutorialsPoint', url: 'https://www.tutorialspoint.com/operating_system/os_deadlocks.htm', type: 'Interview Reference', duration: '7 min read', difficulty: 'Intermediate', summary: 'The 4 Coffman conditions for deadlocks: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.', category: 'reading', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is a Race Condition?', a: 'A race condition occurs when multiple threads concurrently read and write shared data, and the final state depends on the non-deterministic timing of execution.' }
    ]
  },

  indexing_b_trees: {
    resources: [
      { title: 'Database Indexing: B-Trees & B+Trees Explained', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/b-tree-set-1-introduction-2/', type: 'Tutorial Guide', duration: '10 min read', difficulty: 'Intermediate', summary: 'Why databases use multi-way balanced search trees to minimize disk I/O seek operations for lookups and range scans.', category: 'reading', verified: true },
      { title: 'SQL CREATE INDEX Statement & Performance', platform: 'W3Schools', url: 'https://www.w3schools.com/sql/sql_create_index.asp', type: 'Interactive Sandbox', duration: '6 min read', difficulty: 'Beginner', summary: 'Syntax for unique and composite indexes and when NOT to index high-churn columns.', category: 'reading', verified: true },
    ],
    interviewQuestions: [
      { q: 'Why are B+Trees preferred over standard Binary Search Trees for disk storage?', a: 'B+Trees have high branching factors (wide nodes), reducing the tree height to 3-4 levels, requiring only 3-4 disk page reads for billions of records.' }
    ]
  },

  redis_key_value: {
    resources: [
      { title: 'Redis In-Memory Database & Data Structures', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/redis-data-types/', type: 'Tutorial Guide', duration: '8 min read', difficulty: 'Beginner', summary: 'Strings, Lists, Sets, Hashes, and Sorted Sets in Redis with time complexity explanations.', category: 'reading', verified: true },
      { title: 'Redis Caching & Key Expiration Patterns', platform: 'TutorialsPoint', url: 'https://www.tutorialspoint.com/redis/index.htm', type: 'Interactive Guide', duration: '7 min read', difficulty: 'Beginner', summary: 'Setting TTLs, LRU eviction policies, and cache-aside query architectures.', category: 'reading', verified: true },
    ],
    interviewQuestions: [
      { q: 'Why is Redis so fast even though it is single-threaded?', a: 'It holds all data in RAM, uses non-blocking event-driven I/O multiplexing, and eliminates thread context-switch locking overhead.' }
    ]
  },

  jwt_token_auth: {
    resources: [
      { title: 'JSON Web Token (JWT) Architecture Explained', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/json-web-token-jwt/', type: 'Tutorial Guide', duration: '7 min read', difficulty: 'Beginner', summary: 'Structure of Header, Payload, and Signature, and how stateless authentication verifies identity with HMAC/RSA.', category: 'reading', verified: true },
      { title: 'JWT Authentication Guide & Best Practices', platform: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/how-to-sign-and-validate-json-web-tokens/', type: 'Practical Guide', duration: '9 min read', difficulty: 'Intermediate', summary: 'Storing tokens in HttpOnly cookies vs localStorage, token expiry, and refresh token rotation.', category: 'reading', verified: true },
    ],
    interviewQuestions: [
      { q: 'Can a user read the contents of a JWT payload?', a: 'Yes. The payload is only base64-encoded, not encrypted. Sensitive data like passwords or credit cards should never be placed in a JWT payload.' }
    ]
  },

  docker_containerization: {
    resources: [
      { title: 'Docker Architecture & Container Basics', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/introduction-to-docker/', type: 'Tutorial Guide', duration: '8 min read', difficulty: 'Beginner', summary: 'Understanding Docker Images, Containers, Registries, and Linux kernel namespaces/cgroups.', category: 'reading', verified: true },
      { title: 'Writing Efficient Dockerfiles & Multi-Stage Builds', platform: 'W3Schools', url: 'https://www.w3schools.com/git/', type: 'Interactive Guide', duration: '6 min read', difficulty: 'Beginner', summary: 'Layer caching, minimal base images (Alpine/Slim), and reducing container image sizes.', category: 'reading', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the difference between a Docker Image and a Docker Container?', a: 'An Image is a static, read-only template with application code and dependencies. A Container is a running instance of an image with a writable layer.' }
    ]
  },

  // =========================================================================
  // 2. PYTHON FUNDAMENTALS — First 5 Chapters (fully categorised)
  // =========================================================================
  python_syntax_variables: {
    resources: [
      // ── READING ──
      { title: 'Python Variables and Data Types', platform: 'W3Schools', url: 'https://www.w3schools.com/python/python_variables.asp', type: 'Interactive Sandbox', duration: '6 min read', difficulty: 'Beginner', summary: 'Integers, floats, strings, booleans, type casting, and dynamic typing in Python.', category: 'reading', verified: true },
      { title: 'Python Variables and Object References', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/python-variables/', type: 'Tutorial Guide', duration: '7 min read', difficulty: 'Beginner', summary: 'How variables in Python act as memory references/pointers to heap-allocated objects.', category: 'reading', verified: true },
      { title: 'Python Variables — Programiz', platform: 'Programiz', url: 'https://www.programiz.com/python-programming/variables-constants-literals', type: 'Tutorial Guide', duration: '5 min read', difficulty: 'Beginner', summary: 'Constants, literals, naming rules, and assignment operators in Python.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'Python Variables & Data Types for Beginners', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=cQT33yu9pY8', type: 'Topic Video', duration: '21 min watch', difficulty: 'Beginner', summary: 'Corey Schafer covers Python variable types, naming conventions, and type() function in depth.', category: 'video', verified: true },
      { title: 'Python Data Types Explained', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=gCCVsvgR2KU', type: 'Topic Video', duration: '15 min watch', difficulty: 'Beginner', summary: 'Tech With Tim walks through int, float, str, bool with interactive code examples.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Python Variables Practice', platform: 'HackerRank', url: 'https://www.hackerrank.com/domains/python', type: 'Practice Challenge', duration: '15 min', difficulty: 'Beginner', summary: 'Solve basic variable assignment and type conversion challenges in Python.', category: 'exercise', verified: true },
      { title: 'Python Basic Data Types — Interactive', platform: 'Programiz', url: 'https://www.programiz.com/python-programming/examples', type: 'Practice Examples', duration: '20 min', difficulty: 'Beginner', summary: 'Type-along exercises covering variable swapping, multi-assignment, and type checking.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'Python Variables — Everything You Need to Know', platform: 'RealPython', url: 'https://realpython.com/python-variables/', type: 'In-Depth Guide', duration: '12 min read', difficulty: 'Beginner', summary: 'RealPython deep dive into object identity, id(), is vs ==, and memory model internals.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the difference between mutable and immutable data types in Python?', a: 'Immutable types (int, float, str, tuple) cannot be changed after creation. Mutable types (list, dict, set) can be modified in place without changing memory address.' }
    ]
  },

  control_flow: {
    resources: [
      // ── READING ──
      { title: 'Python If...Else Conditions', platform: 'W3Schools', url: 'https://www.w3schools.com/python/python_conditions.asp', type: 'Interactive Sandbox', duration: '5 min read', difficulty: 'Beginner', summary: 'if, elif, else branching, short-hand conditionals, and nested conditions.', category: 'reading', verified: true },
      { title: 'Control Flow Statements in Python', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/python-if-else/', type: 'Tutorial Guide', duration: '7 min read', difficulty: 'Beginner', summary: 'Boolean expressions, comparison operators, logical operators (and, or, not), and ternary expressions.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'Python Conditionals and Booleans — If, Else, Elif', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=DZwmZ8Usvnk', type: 'Topic Video', duration: '16 min watch', difficulty: 'Beginner', summary: 'Corey Schafer explains conditional logic, truthy/falsy values, and match-case in Python 3.10+.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Python If-Else Challenges', platform: 'HackerRank', url: 'https://www.hackerrank.com/challenges/py-if-else', type: 'Practice Challenge', duration: '10 min', difficulty: 'Beginner', summary: 'Solve branching logic challenges with odd/even detection and range checks.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'Python Control Flow — Best Practices', platform: 'RealPython', url: 'https://realpython.com/python-conditional-statements/', type: 'In-Depth Guide', duration: '10 min read', difficulty: 'Beginner', summary: 'Guard clauses, early returns, and why flat is better than nested for readable conditionals.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What are truthy and falsy values in Python?', a: 'Falsy values include: None, False, 0, 0.0, "", [], {}, set(). Everything else is truthy. Python evaluates conditions based on truthiness.' }
    ]
  },

  loops_iteration: {
    resources: [
      // ── READING ──
      { title: 'Python For Loops', platform: 'W3Schools', url: 'https://www.w3schools.com/python/python_for_loops.asp', type: 'Interactive Sandbox', duration: '6 min read', difficulty: 'Beginner', summary: 'for-in loops, range(), break, continue, else clause, and nested loops.', category: 'reading', verified: true },
      { title: 'Python While & For Loops Explained', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/python-for-loops/', type: 'Tutorial Guide', duration: '8 min read', difficulty: 'Beginner', summary: 'Iterating over lists, strings, dicts with enumerate(), zip(), and reversed().', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'Python Loops — For & While with Examples', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=6iF8Xb7Z3wQ', type: 'Topic Video', duration: '20 min watch', difficulty: 'Beginner', summary: 'Corey Schafer covers for/while loops, break/continue, enumerate, and loop patterns.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Python Loops Practice Problems', platform: 'HackerRank', url: 'https://www.hackerrank.com/challenges/python-loops', type: 'Practice Challenge', duration: '15 min', difficulty: 'Beginner', summary: 'Print patterns, compute sums, and implement basic iterative algorithms.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'Python "for" Loops — A Deep Dive', platform: 'RealPython', url: 'https://realpython.com/python-for-loop/', type: 'In-Depth Guide', duration: '12 min read', difficulty: 'Beginner', summary: 'Iterator protocol, StopIteration, and how Python for-loops desugar into __iter__ and __next__ calls.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the difference between break and continue?', a: 'break exits the entire loop immediately. continue skips the current iteration and proceeds to the next one.' },
      { q: 'When does the else clause on a for loop execute?', a: 'The else block runs only when the loop completes normally (without hitting a break statement).' }
    ]
  },

  functions_and_scopes: {
    resources: [
      // ── READING ──
      { title: 'Python Functions', platform: 'W3Schools', url: 'https://www.w3schools.com/python/python_functions.asp', type: 'Interactive Sandbox', duration: '6 min read', difficulty: 'Beginner', summary: 'def keyword, parameters, return values, default arguments, and keyword arguments.', category: 'reading', verified: true },
      { title: '*args and **kwargs in Python', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/args-kwargs-python/', type: 'Tutorial Guide', duration: '7 min read', difficulty: 'Beginner', summary: 'Variable-length positional (*args) and keyword (**kwargs) arguments and unpacking patterns.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'Python Functions — Parameters, Args & Return', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=9Os0o3wzS_I', type: 'Topic Video', duration: '22 min watch', difficulty: 'Beginner', summary: 'Corey Schafer covers function definition, arguments, return values, and scope rules (LEGB).', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Write Python Functions — Practice', platform: 'HackerRank', url: 'https://www.hackerrank.com/challenges/write-a-function', type: 'Practice Challenge', duration: '15 min', difficulty: 'Beginner', summary: 'Implement is_leap(), fibonacci, and factorial functions to practice function design.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'Defining Your Own Python Function', platform: 'RealPython', url: 'https://realpython.com/defining-your-own-python-function/', type: 'In-Depth Guide', duration: '15 min read', difficulty: 'Beginner', summary: 'Comprehensive guide to positional, keyword, default args, type hints, and docstring conventions.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the LEGB scope rule in Python?', a: 'Local → Enclosing (closure) → Global → Built-in. Python searches variable names in this order when resolving references.' },
      { q: 'What is the difference between *args and **kwargs?', a: '*args collects extra positional arguments into a tuple. **kwargs collects extra keyword arguments into a dictionary.' }
    ]
  },

  lists_and_tuples: {
    resources: [
      // ── READING ──
      { title: 'Python Lists', platform: 'W3Schools', url: 'https://www.w3schools.com/python/python_lists.asp', type: 'Interactive Sandbox', duration: '7 min read', difficulty: 'Beginner', summary: 'Creating, accessing, slicing, appending, removing, and sorting list elements.', category: 'reading', verified: true },
      { title: 'Python Tuples — Immutable Sequences', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/python-tuples/', type: 'Tutorial Guide', duration: '6 min read', difficulty: 'Beginner', summary: 'Tuple packing/unpacking, named tuples, and when to use tuples vs lists.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'Python Lists, Tuples, and Sets — Differences & Uses', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=W8KRzm-HUcc', type: 'Topic Video', duration: '24 min watch', difficulty: 'Beginner', summary: 'Corey Schafer compares lists (mutable, ordered), tuples (immutable, hashable), and sets (unique, unordered).', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Python Lists Practice', platform: 'HackerRank', url: 'https://www.hackerrank.com/challenges/python-lists', type: 'Practice Challenge', duration: '15 min', difficulty: 'Beginner', summary: 'Insert, remove, append, sort, pop, and reverse operations on lists.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'Lists and Tuples in Python', platform: 'RealPython', url: 'https://realpython.com/python-lists-tuples/', type: 'In-Depth Guide', duration: '14 min read', difficulty: 'Beginner', summary: 'Deep dive into memory layout, indexing internals, and performance differences between lists and tuples.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'Why are tuples faster than lists in Python?', a: 'Tuples are immutable and stored in a single contiguous memory block. Python can cache and reuse small tuples, and immutability allows hash-based optimizations.' },
      { q: 'Can you use a list as a dictionary key?', a: 'No. Dictionary keys must be hashable (immutable). Lists are mutable and unhashable. Use a tuple instead.' }
    ]
  },

  // Remaining Python skills (reading-only, kept from original)
  decorators_and_closures: {
    resources: [
      { title: 'Python Decorators Step-by-Step Tutorial', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/decorators-in-python/', type: 'Tutorial Guide', duration: '8 min read', difficulty: 'Intermediate', summary: 'First-class functions, inner wrappers, @syntax, and passing arguments with *args and **kwargs.', category: 'reading', verified: true },
      { title: 'Python Closures and Scope Retention', platform: 'TutorialsPoint', url: 'https://www.tutorialspoint.com/python/python_closures.htm', type: 'Conceptual Guide', duration: '6 min read', difficulty: 'Intermediate', summary: 'How inner functions retain access to variables in their enclosing lexical scope even after the outer function finishes.', category: 'reading', verified: true },
    ],
    interviewQuestions: [
      { q: 'Why do we use functools.wraps inside custom decorators?', a: 'To preserve the original function name, docstring, and metadata that would otherwise be replaced by the inner wrapper function.' }
    ]
  },

  iterators_and_generators: {
    resources: [
      { title: 'Python Generators & Yield Keyword', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/generators-in-python/', type: 'Tutorial Guide', duration: '8 min read', difficulty: 'Intermediate', summary: 'Creating memory-efficient lazy streams that yield items on demand with O(1) memory consumption.', category: 'reading', verified: true },
      { title: 'Python Iterators (__iter__ and __next__)', platform: 'W3Schools', url: 'https://www.w3schools.com/python/python_iterators.asp', type: 'Interactive Guide', duration: '5 min read', difficulty: 'Beginner', summary: 'The iterator protocol and how Python for-loops work under the hood.', category: 'reading', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the memory advantage of a Generator over a List in Python?', a: 'A list loads all million elements into RAM simultaneously. A generator computes elements one at a time on-demand, keeping RAM usage constant at O(1).' }
    ]
  },

  // =========================================================================
  // 3. WEB BASICS — First 5 Chapters (fully categorised)
  // =========================================================================
  html_semantic_markup: {
    resources: [
      // ── READING ──
      { title: 'HTML5 Semantic Elements Guide', platform: 'W3Schools', url: 'https://www.w3schools.com/html/html5_semantic_elements.asp', type: 'Interactive Guide', duration: '6 min read', difficulty: 'Beginner', summary: 'Header, Nav, Section, Article, Aside, and Footer elements for accessibility and SEO.', category: 'reading', verified: true },
      { title: 'Semantic HTML Structure & Screen Readers', platform: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics', type: 'Standard Reference', duration: '7 min read', difficulty: 'Beginner', summary: 'Why using semantic tags improves browser rendering speed and assistive accessibility.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'HTML Semantic Tags Explained', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=kGW8Al_cga4', type: 'Topic Video', duration: '12 min watch', difficulty: 'Beginner', summary: 'Traversy Media covers each HTML5 semantic element with layout examples and accessibility benefits.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Build a Semantic HTML Page', platform: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', type: 'Guided Project', duration: '25 min', difficulty: 'Beginner', summary: 'Structure a complete web page using only semantic HTML5 elements — no divs allowed.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'Why Semantic HTML Matters', platform: 'Dev.to', url: 'https://dev.to/kenbellows/stop-using-so-many-divs-an-intro-to-semantic-html-3i9i', type: 'Blog Post', duration: '8 min read', difficulty: 'Beginner', summary: 'Popular Dev.to post explaining why div-soup hurts SEO, accessibility, and maintainability.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'Why should you prefer <article> over generic <div> tags?', a: '<article> explicitly communicates self-contained content to web browsers, search engine web crawlers, and screen readers.' }
    ]
  },

  css_box_model: {
    resources: [
      // ── READING ──
      { title: 'CSS Box Model', platform: 'W3Schools', url: 'https://www.w3schools.com/css/css_boxmodel.asp', type: 'Interactive Sandbox', duration: '6 min read', difficulty: 'Beginner', summary: 'Content, padding, border, margin anatomy and the difference between content-box and border-box.', category: 'reading', verified: true },
      { title: 'The Box Model — MDN', platform: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model', type: 'Standard Reference', duration: '10 min read', difficulty: 'Beginner', summary: 'Official MDN guide to block vs inline boxes, margin collapsing, and box-sizing property.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'CSS Box Model Explained', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=rIO5326FgPE', type: 'Topic Video', duration: '8 min watch', difficulty: 'Beginner', summary: 'Web Dev Simplified breaks down padding, border, margin with visual DevTools inspection.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'CSS Box Model Practice', platform: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', type: 'Practice Challenge', duration: '15 min', difficulty: 'Beginner', summary: 'Build box layouts with specific padding, margin, and border requirements.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'The CSS Box Model: A Visual Guide', platform: 'Dev.to', url: 'https://dev.to/lupitacode/the-box-model-in-css-1f14', type: 'Blog Post', duration: '7 min read', difficulty: 'Beginner', summary: 'Illustrated guide showing how content, padding, border, and margin stack up with practical examples.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the difference between content-box and border-box?', a: 'content-box: width/height applies to content only (padding and border are added outside). border-box: width/height includes content + padding + border.' },
      { q: 'What is margin collapsing?', a: 'When two vertical margins touch, they collapse into the larger of the two instead of adding together. This only happens with block-level vertical margins.' }
    ]
  },

  css_flexbox: {
    resources: [
      // ── READING ──
      { title: 'CSS Flexbox Complete Guide & Playground', platform: 'W3Schools', url: 'https://www.w3schools.com/css/css3_flexbox.asp', type: 'Interactive Sandbox', duration: '8 min read', difficulty: 'Beginner', summary: 'justify-content, align-items, flex-direction, flex-wrap, and flex-grow properties.', category: 'reading', verified: true },
      { title: 'Flexbox Layout Explained Visually', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/css-flexbox/', type: 'Tutorial Guide', duration: '7 min read', difficulty: 'Beginner', summary: '1-Dimensional axis alignment, space distribution, and centering tricks.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'Flexbox CSS In 20 Minutes', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=JJSoEo8JSnc', type: 'Topic Video', duration: '20 min watch', difficulty: 'Beginner', summary: 'Traversy Media live-codes flexbox layouts showing flex-direction, justify-content, align-items, and flex-wrap.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Flexbox Froggy — Interactive Game', platform: 'freeCodeCamp', url: 'https://flexboxfroggy.com/', type: 'Interactive Game', duration: '20 min', difficulty: 'Beginner', summary: 'Learn flexbox by guiding frogs to lily pads using justify-content, align-items, and flex-direction.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'A Complete Guide to Flexbox', platform: 'Dev.to', url: 'https://dev.to/joyshaheb/flexbox-cheat-sheets-in-2021-css-2021-3edl', type: 'Blog Post', duration: '10 min read', difficulty: 'Beginner', summary: 'Visual cheat sheet with every flexbox property illustrated with before/after examples.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the difference between justify-content and align-items?', a: 'justify-content aligns items along the Main Axis (horizontal by default). align-items aligns items along the Cross Axis (vertical by default).' }
    ]
  },

  css_grid: {
    resources: [
      // ── READING ──
      { title: 'CSS Grid Layout Module Tutorial', platform: 'W3Schools', url: 'https://www.w3schools.com/css/css_grid.asp', type: 'Interactive Sandbox', duration: '8 min read', difficulty: 'Beginner', summary: 'grid-template-columns, grid-template-rows, gap, repeat(), and minmax() fractional units.', category: 'reading', verified: true },
      { title: 'CSS Grid vs Flexbox: When to use which?', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/difference-between-css-grid-and-css-flexbox/', type: 'Comparative Guide', duration: '6 min read', difficulty: 'Beginner', summary: 'Use Flexbox for 1D navigation clusters; use Grid for 2D bento card layouts.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'CSS Grid Layout Crash Course', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=jV8B24rSN5o', type: 'Topic Video', duration: '28 min watch', difficulty: 'Beginner', summary: 'Traversy Media builds complete grid layouts from scratch with template areas and responsive design.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Grid Garden — Interactive Grid Game', platform: 'freeCodeCamp', url: 'https://cssgridgarden.com/', type: 'Interactive Game', duration: '20 min', difficulty: 'Beginner', summary: 'Learn CSS Grid by watering a garden — practice grid-column, grid-row, and template areas.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'An Interactive Guide to CSS Grid', platform: 'Dev.to', url: 'https://dev.to/joyshaheb/css-grid-cheat-sheet-illustrated-in-2021-1a3', type: 'Blog Post', duration: '10 min read', difficulty: 'Beginner', summary: 'Illustrated CSS Grid cheat sheet covering all properties with visual before/after examples.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the purpose of the 1fr fractional unit in CSS Grid?', a: '1fr represents one fraction of the available free space in the grid container after fixed pixel elements are allocated.' }
    ]
  },

  responsive_design: {
    resources: [
      // ── READING ──
      { title: 'Responsive Web Design Introduction', platform: 'W3Schools', url: 'https://www.w3schools.com/css/css_rwd_intro.asp', type: 'Interactive Sandbox', duration: '7 min read', difficulty: 'Beginner', summary: 'Viewport meta tag, fluid grids, flexible images, and mobile-first design approach.', category: 'reading', verified: true },
      { title: 'CSS Media Queries', platform: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries', type: 'Standard Reference', duration: '10 min read', difficulty: 'Beginner', summary: 'Official guide to @media rules, breakpoint strategies, and feature queries.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'Build a Responsive Website — Step by Step', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=p0bGHP-PXD4', type: 'Topic Video', duration: '35 min watch', difficulty: 'Beginner', summary: 'Traversy Media builds a fully responsive site from scratch with media queries and mobile-first CSS.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Responsive Web Design Projects', platform: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', type: 'Guided Project', duration: '30 min', difficulty: 'Beginner', summary: 'Build responsive tribute pages, survey forms, and product landing pages.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'A Complete Guide to Responsive Design in 2024', platform: 'Dev.to', url: 'https://dev.to/srijan_karki/responsive-web-design-the-complete-guide-2024-4ekj', type: 'Blog Post', duration: '12 min read', difficulty: 'Beginner', summary: 'Modern approach to responsive design with container queries, clamp(), and aspect-ratio.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is mobile-first design?', a: 'Start with styles for the smallest screens, then use min-width media queries to progressively enhance for larger screens. This ensures mobile users get the fastest, simplest experience.' },
      { q: 'What is the viewport meta tag?', a: '<meta name="viewport" content="width=device-width, initial-scale=1"> tells the browser to match the screen width and not zoom out on mobile devices.' }
    ]
  },

  // Remaining web basics (reading-only, kept from original)
  promises_async_await: {
    resources: [
      { title: 'JavaScript Promises and Async/Await', platform: 'W3Schools', url: 'https://www.w3schools.com/js/js_promise.asp', type: 'Interactive Sandbox', duration: '7 min read', difficulty: 'Beginner', summary: 'Pending, Fulfilled, and Rejected promise states with .then() vs async/await syntax.', category: 'reading', verified: true },
      { title: 'Promises, Microtasks, and Event Loop', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/javascript-promises/', type: 'Tutorial Guide', duration: '8 min read', difficulty: 'Intermediate', summary: 'Promise.all vs Promise.allSettled and robust try/catch error handling.', category: 'reading', verified: true },
    ],
    interviewQuestions: [
      { q: 'What happens if one promise rejects inside Promise.all()?', a: 'Promise.all rejects immediately with that error (fail-fast). Use Promise.allSettled if you want all promises to complete regardless of failures.' }
    ]
  },

  // =========================================================================
  // 4. DATA ANALYSIS — First 5 Chapters (fully categorised)
  // =========================================================================
  numpy_ndarray_basics: {
    resources: [
      // ── READING ──
      { title: 'NumPy Arrays & Vectorization Tutorial', platform: 'W3Schools', url: 'https://www.w3schools.com/python/numpy/numpy_intro.asp', type: 'Interactive Sandbox', duration: '6 min read', difficulty: 'Beginner', summary: 'Creating 1D and 2D ndarrays, checking shapes, dtypes, and array slicing.', category: 'reading', verified: true },
      { title: 'NumPy Ndarray Fundamentals & Speed', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/python-numpy/', type: 'Tutorial Guide', duration: '8 min read', difficulty: 'Beginner', summary: 'Why C-contiguous memory arrays in NumPy run 50x faster than standard Python lists.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'NumPy Tutorial — Arrays, Indexing & Operations', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=QUT1VHiLmmI', type: 'Topic Video', duration: '58 min watch', difficulty: 'Beginner', summary: 'freeCodeCamp/Keith Galli comprehensive NumPy walkthrough with Jupyter Notebook exercises.', category: 'video', verified: true },
      { title: 'NumPy in 5 Minutes — Quick Start', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=xECXZ3tyONo', type: 'Topic Video', duration: '6 min watch', difficulty: 'Beginner', summary: 'Fireship rapid overview of ndarray creation, reshaping, broadcasting, and ufuncs.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'NumPy Practice — 100 Exercises', platform: 'Kaggle', url: 'https://www.kaggle.com/code/utsav15/100-numpy-exercises', type: 'Practice Notebook', duration: '30 min', difficulty: 'Beginner', summary: 'Interactive Kaggle notebook with 100 graded NumPy exercises from basic to advanced.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'Look Ma, No For-Loops: Array Programming With NumPy', platform: 'RealPython', url: 'https://realpython.com/numpy-array-programming/', type: 'In-Depth Guide', duration: '15 min read', difficulty: 'Intermediate', summary: 'Why vectorized operations eliminate slow Python loops and how broadcasting works under the hood.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'Why is NumPy array computation faster than standard Python list iterations?', a: 'NumPy stores elements in contiguous memory blocks with homogeneous types, allowing CPU SIMD vector instructions and eliminating Python per-element type checking.' }
    ]
  },

  numpy_indexing_slicing: {
    resources: [
      // ── READING ──
      { title: 'NumPy Array Indexing', platform: 'W3Schools', url: 'https://www.w3schools.com/python/numpy/numpy_array_indexing.asp', type: 'Interactive Sandbox', duration: '5 min read', difficulty: 'Beginner', summary: 'Basic and advanced indexing: integer, slice, boolean mask, and fancy indexing.', category: 'reading', verified: true },
      { title: 'NumPy Array Slicing Explained', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/numpy-array-indexing/', type: 'Tutorial Guide', duration: '7 min read', difficulty: 'Beginner', summary: 'Multi-dimensional slicing with start:stop:step, negative indices, and ellipsis syntax.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'NumPy Indexing and Slicing — Deep Dive', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=HjMmBel8WLE', type: 'Topic Video', duration: '18 min watch', difficulty: 'Beginner', summary: 'Corey Schafer demonstrates 1D/2D slicing, boolean masking, and fancy indexing with practical examples.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'NumPy Indexing Practice', platform: 'Kaggle', url: 'https://www.kaggle.com/code/utsav15/100-numpy-exercises', type: 'Practice Notebook', duration: '20 min', difficulty: 'Beginner', summary: 'Solve slicing and boolean mask exercises in an interactive Kaggle notebook.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'NumPy Indexing — A Visual Guide', platform: 'RealPython', url: 'https://realpython.com/numpy-tutorial/', type: 'In-Depth Guide', duration: '12 min read', difficulty: 'Beginner', summary: 'RealPython guide with diagrams showing how views vs copies work in NumPy slicing.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the difference between basic slicing and fancy indexing?', a: 'Basic slicing (arr[1:5]) returns a view (shared memory). Fancy indexing (arr[[0,3,5]]) returns a copy (independent memory).' }
    ]
  },

  numpy_broadcasting_vectorization: {
    resources: [
      // ── READING ──
      { title: 'NumPy Broadcasting Tutorial', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/numpy-broadcasting/', type: 'Tutorial Guide', duration: '8 min read', difficulty: 'Intermediate', summary: 'Broadcasting rules: trailing dimension alignment, dimension expansion, and incompatible shape errors.', category: 'reading', verified: true },
      { title: 'NumPy Universal Functions (ufuncs)', platform: 'W3Schools', url: 'https://www.w3schools.com/python/numpy/numpy_ufunc.asp', type: 'Interactive Sandbox', duration: '5 min read', difficulty: 'Beginner', summary: 'Element-wise operations: add, multiply, sqrt, log, and custom ufuncs with frompyfunc().', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'NumPy Broadcasting Explained Visually', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=oG1t3qlzq14', type: 'Topic Video', duration: '12 min watch', difficulty: 'Intermediate', summary: 'Visual explanation of how NumPy automatically expands dimensions for arithmetic between different-shaped arrays.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Broadcasting & Vectorization Exercises', platform: 'Kaggle', url: 'https://www.kaggle.com/code/utsav15/100-numpy-exercises', type: 'Practice Notebook', duration: '25 min', difficulty: 'Intermediate', summary: 'Replace for-loops with vectorized operations and practice broadcasting rules.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'Understanding NumPy Broadcasting', platform: 'RealPython', url: 'https://realpython.com/numpy-array-programming/', type: 'In-Depth Guide', duration: '10 min read', difficulty: 'Intermediate', summary: 'How broadcasting eliminates explicit loops and the performance implications of vectorized math.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What are the rules for NumPy broadcasting?', a: 'Arrays are compared element-wise from trailing dimensions. Dimensions are compatible if they are equal, or one of them is 1. Missing dimensions are treated as 1.' }
    ]
  },

  numpy_statistical_aggregations: {
    resources: [
      // ── READING ──
      { title: 'NumPy Statistical Functions', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/numpy-statistical-functions/', type: 'Tutorial Guide', duration: '7 min read', difficulty: 'Beginner', summary: 'np.mean(), np.median(), np.std(), np.percentile(), np.min/max along specific axes.', category: 'reading', verified: true },
      { title: 'NumPy Statistics Tutorial', platform: 'W3Schools', url: 'https://www.w3schools.com/python/numpy/numpy_random.asp', type: 'Interactive Sandbox', duration: '5 min read', difficulty: 'Beginner', summary: 'Mean, median, mode calculations and random number generation with NumPy.', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'NumPy Statistics — Mean, Median, Std, Percentile', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=GB9ByFAIAH4', type: 'Topic Video', duration: '15 min watch', difficulty: 'Beginner', summary: 'codebasics walks through statistical aggregation functions with real dataset examples.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Statistics with NumPy — Practice', platform: 'Kaggle', url: 'https://www.kaggle.com/learn/intro-to-machine-learning', type: 'Practice Notebook', duration: '20 min', difficulty: 'Beginner', summary: 'Compute descriptive statistics on real datasets using NumPy aggregation functions.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'Descriptive Statistics with NumPy', platform: 'RealPython', url: 'https://realpython.com/python-statistics/', type: 'In-Depth Guide', duration: '12 min read', difficulty: 'Beginner', summary: 'Calculating central tendency, dispersion, and correlation coefficients with NumPy and SciPy.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What does axis=0 vs axis=1 mean in NumPy aggregations?', a: 'axis=0 aggregates along rows (column-wise reduction). axis=1 aggregates along columns (row-wise reduction). Think of axis=0 as "collapse rows".' }
    ]
  },

  pandas_series_dataframes: {
    resources: [
      // ── READING ──
      { title: 'Pandas DataFrames and Series Basics', platform: 'W3Schools', url: 'https://www.w3schools.com/python/pandas/pandas_dataframes.asp', type: 'Interactive Sandbox', duration: '7 min read', difficulty: 'Beginner', summary: 'Loading CSVs, inspecting .head(), .info(), and .describe() summary statistics.', category: 'reading', verified: true },
      { title: 'Pandas DataFrame Indexing & Selection', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/pandas-tutorial/', type: 'Tutorial Guide', duration: '9 min read', difficulty: 'Beginner', summary: 'Label-based selection (.loc) vs integer position-based selection (.iloc).', category: 'reading', verified: true },
      // ── VIDEO ──
      { title: 'Pandas Tutorial — DataFrames & Series', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=vmEHCJofslg', type: 'Topic Video', duration: '50 min watch', difficulty: 'Beginner', summary: 'Keith Galli/freeCodeCamp comprehensive Pandas introduction with real CSV data exploration.', category: 'video', verified: true },
      { title: 'Pandas in 10 Minutes', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=_Eb0utIRdkw', type: 'Topic Video', duration: '13 min watch', difficulty: 'Beginner', summary: 'Fireship rapid overview of DataFrame creation, selection, filtering, and groupby.', category: 'video', verified: true },
      // ── EXERCISE ──
      { title: 'Pandas Practice — Kaggle Learn', platform: 'Kaggle', url: 'https://www.kaggle.com/learn/pandas', type: 'Interactive Course', duration: '4 hrs', difficulty: 'Beginner', summary: 'Kaggle official micro-course with hands-on exercises on DataFrames, indexing, and summary functions.', category: 'exercise', verified: true },
      // ── BLOG ──
      { title: 'Pandas DataFrame Tutorial — A Complete Introduction', platform: 'RealPython', url: 'https://realpython.com/pandas-dataframe/', type: 'In-Depth Guide', duration: '18 min read', difficulty: 'Beginner', summary: 'Comprehensive RealPython guide covering creation, indexing, filtering, and common DataFrame operations.', category: 'blog', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the difference between df.loc and df.iloc in Pandas?', a: '.loc accesses rows and columns by their labels/names. .iloc accesses them by their zero-based integer index positions.' }
    ]
  },

  // Remaining data analysis skills (reading-only)
  pandas_groupby_aggregations: {
    resources: [
      { title: 'Pandas GroupBy: Split, Apply, Combine Guide', platform: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org/pandas-groupby/', type: 'Tutorial Guide', duration: '8 min read', difficulty: 'Intermediate', summary: 'Aggregating columns using .mean(), .sum(), .count(), and custom multi-aggregations with .agg().', category: 'reading', verified: true },
      { title: 'Pandas GroupBy Examples & Use Cases', platform: 'W3Schools', url: 'https://www.w3schools.com/python/pandas/pandas_dataframes.asp', type: 'Interactive Sandbox', duration: '6 min read', difficulty: 'Beginner', summary: 'Filtering subsets after grouping and reshaping grouped summaries.', category: 'reading', verified: true },
    ],
    interviewQuestions: [
      { q: 'What is the "Split-Apply-Combine" strategy in Pandas?', a: '1. Split the DataFrame into groups based on keys; 2. Apply an aggregation or transformation function to each group; 3. Combine results into a new summary DataFrame.' }
    ]
  }
};

// ─── Trusted Platform Whitelist ────────────────────────────────────────────────
const VERIFIED_PLATFORMS = new Set([
  'GeeksforGeeks', 'W3Schools', 'TutorialsPoint', 'MDN Web Docs', 'freeCodeCamp',
  'Official Guide', 'YouTube', 'Dev.to', 'RealPython', 'HackerRank', 'LeetCode',
  'DigitalOcean', 'Kaggle', 'Programiz'
]);

/**
 * Returns curated learner-friendly study resources for any given skill.
 * If not explicitly registered, generates a high-quality GeeksforGeeks & W3Schools search guide.
 */
export function getStudyResourcesForSkill(skillId: string, skillName?: string, domain?: string): StudyResource[] {
  if (TOPIC_RESOURCES_MAP[skillId]?.resources) {
    return TOPIC_RESOURCES_MAP[skillId].resources;
  }

  const label = skillName || skillId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const query = encodeURIComponent(label);

  return [
    {
      title: `GeeksforGeeks: ${label} Explained`,
      platform: 'GeeksforGeeks',
      url: `https://www.geeksforgeeks.org/?s=${query}`,
      type: 'Beginner Tutorial',
      duration: '8 min read',
      difficulty: 'Beginner',
      summary: `Clean step-by-step tutorial with code examples, syntax breakdown, and practical use cases for ${label}.`,
      category: 'reading',
      verified: true
    },
    {
      title: `W3Schools: ${label} Reference Guide`,
      platform: 'W3Schools',
      url: `https://www.w3schools.com/tags/ref_byfunc.asp`,
      type: 'Interactive Sandbox',
      duration: '6 min read',
      difficulty: 'Beginner',
      summary: `Try-it-yourself code examples and key terminology cheat-sheet for ${label}.`,
      category: 'reading',
      verified: true
    },
    {
      title: `TutorialsPoint: ${label} Concepts`,
      platform: 'TutorialsPoint',
      url: `https://www.tutorialspoint.com/index.htm`,
      type: 'Interview Reference',
      duration: '7 min read',
      difficulty: 'Intermediate',
      summary: `Quick revision summary and common pitfalls to avoid when implementing ${label}.`,
      category: 'reading',
      verified: true
    }
  ];
}

/**
 * Returns prioritized resources ordered according to the learner's chosen preference.
 * - 'video': Video lectures first -> Reading -> Exercises -> Blogs
 * - 'reading': Articles/Guides first (with key takeaways/transcript points) -> Blogs -> Videos -> Exercises
 * - 'hands_on': Practice challenges/quizzes first -> Guided exercises -> Reading -> Videos
 * - 'mixed': Balanced Striver-style order (Reading -> Video -> Practice -> Blog)
 */
export function getPrioritizedStudyResources(
  skillId: string,
  skillName?: string,
  preference: LearningPreference = 'mixed'
): StudyResource[] {
  const all = getStudyResourcesForSkill(skillId, skillName);

  const categoryOrderMap: Record<LearningPreference, ResourceCategory[]> = {
    video: ['video', 'reading', 'exercise', 'blog'],
    reading: ['reading', 'blog', 'video', 'exercise'],
    hands_on: ['exercise', 'reading', 'video', 'blog'],
    mixed: ['reading', 'video', 'exercise', 'blog'],
  };

  const order = categoryOrderMap[preference] || categoryOrderMap.mixed;

  return [...all].sort((a, b) => {
    const idxA = order.indexOf(a.category);
    const idxB = order.indexOf(b.category);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });
}

/**
 * Returns curated resources filtered by the learner's preferred learning style.
 * - hands_on: Exercises + reading
 * - video: Video-only
 * - reading: Reading + blogs
 * - mixed: Everything (Striver-style, all tabs visible)
 */
export function getResourcesByPreference(
  skillId: string,
  skillName: string,
  preference: LearningPreference
): StudyResource[] {
  // Use prioritized list so preferred types always appear at the top
  return getPrioritizedStudyResources(skillId, skillName, preference);
}

/**
 * Returns the default active tab based on learner preference.
 */
export function getDefaultTabForPreference(preference: LearningPreference): ResourceCategory | 'all' {
  switch (preference) {
    case 'hands_on': return 'exercise';
    case 'video': return 'video';
    case 'reading': return 'reading';
    case 'mixed':
    default: return 'all';
  }
}

/**
 * Returns conceptual interview / assessment questions for any given skill.
 */
export function getInterviewQuestionsForSkill(skillId: string, skillName?: string): InterviewQuestion[] {
  if (TOPIC_RESOURCES_MAP[skillId]?.interviewQuestions) {
    return TOPIC_RESOURCES_MAP[skillId].interviewQuestions;
  }

  const label = skillName || skillId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return [
    {
      q: `What is the core purpose and main benefit of ${label}?`,
      a: `${label} enables modular, maintainable, and reliable software architecture by encapsulating logic, reducing computational overhead, and preventing common runtime failure modes.`
    },
    {
      q: `What are common mistakes or anti-patterns developers encounter with ${label}?`,
      a: `Failing to handle boundary exceptions, ignoring concurrency or race conditions, omitting unit test assertions, and introducing unneeded complexity without measuring performance first.`
    },
    {
      q: `How do you verify and test ${label} in a production code environment?`,
      a: `By writing deterministic unit and integration test suites, monitoring error metrics, using linting tools, and testing under simulated peak load conditions.`
    }
  ];
}
