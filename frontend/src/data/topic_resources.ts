/**
 * SkillTwin Curated Learner-Friendly Study Resources
 * Maps every domain skill to beginner-friendly tutorials from GeeksforGeeks, W3Schools, TutorialsPoint, and MDN.
 */

export interface StudyResource {
  title: string;
  platform: 'GeeksforGeeks' | 'W3Schools' | 'TutorialsPoint' | 'MDN Web Docs' | 'freeCodeCamp' | 'Official Guide';
  url: string;
  type: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  keyPoints?: string[];
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
  // 1. BACKEND ENGINEERING
  // =========================================================================
  http_basics: {
    resources: [
      {
        title: 'HTTP Protocol Basics & Status Codes',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/http-full-form/',
        type: 'Tutorial Guide',
        duration: '7 min read',
        difficulty: 'Beginner',
        summary: 'Learn request methods (GET, POST, PUT, DELETE), header structures, and HTTP status code categories (2xx, 3xx, 4xx, 5xx).'
      },
      {
        title: 'HTTP Methods Explained (GET vs POST)',
        platform: 'W3Schools',
        url: 'https://www.w3schools.com/tags/ref_httpmethods.asp',
        type: 'Interactive Guide',
        duration: '5 min read',
        difficulty: 'Beginner',
        summary: 'Clear comparison of request parameters in URL query strings vs request bodies.'
      }
    ],
    interviewQuestions: [
      {
        q: 'What is the difference between HTTP PUT and HTTP PATCH?',
        a: 'PUT replaces the entire resource document with the new payload. PATCH applies a partial update, modifying only the fields specified in the request.'
      },
      {
        q: 'Why is HTTP/2 multiplexing better than HTTP/1.1 pipelining?',
        a: 'HTTP/2 sends multiple request/response streams concurrently over a single TCP connection, eliminating head-of-line blocking.'
      }
    ]
  },

  threads_and_processes: {
    resources: [
      {
        title: 'Difference Between Process and Thread in OS',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/difference-between-process-and-thread/',
        type: 'Tutorial Guide',
        duration: '8 min read',
        difficulty: 'Beginner',
        summary: 'How processes have independent memory address spaces while threads share the process heap and data segment.'
      },
      {
        title: 'Operating System Multithreading Architecture',
        platform: 'TutorialsPoint',
        url: 'https://www.tutorialspoint.com/operating_system/os_multi_threading.htm',
        type: 'Conceptual Guide',
        duration: '9 min read',
        difficulty: 'Intermediate',
        summary: 'User-level vs kernel-level threads, context switching overhead, and thread scheduling models.'
      }
    ],
    interviewQuestions: [
      {
        q: 'Why do threads share the heap memory but keep separate stack memory?',
        a: 'The shared heap enables fast inter-thread communication without IPC overhead. Separate stacks are necessary to maintain independent local function calls and variable frames.'
      },
      {
        q: 'What happens during a CPU context switch between two threads?',
        a: 'The CPU program counter, stack pointer, and registers are saved into the Thread Control Block (TCB), and the next scheduled thread registers are loaded.'
      }
    ]
  },

  async_await_event_loop: {
    resources: [
      {
        title: 'Understanding Asynchronous Programming & Event Loops',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/python-asyncio-an-introduction-to-asynchronous-programming-in-python/',
        type: 'Tutorial Guide',
        duration: '10 min read',
        difficulty: 'Intermediate',
        summary: 'How single-threaded non-blocking I/O multiplexing handles thousands of concurrent socket connections.'
      },
      {
        title: 'JavaScript Event Loop & Concurrency Model',
        platform: 'MDN Web Docs',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop',
        type: 'Interactive Guide',
        duration: '8 min read',
        difficulty: 'Intermediate',
        summary: 'Visualizing the Call Stack, Macro-task Queue, Micro-task Queue, and non-blocking worker pools.'
      }
    ],
    interviewQuestions: [
      {
        q: 'Is async I/O multithreaded by default?',
        a: 'No. Async I/O uses non-blocking kernel socket polling (epoll/kqueue) on a single thread. The event loop switches tasks when waiting for I/O.'
      },
      {
        q: 'When should you use Asyncio instead of Multiprocessing in Python?',
        a: 'Use Asyncio for I/O-bound tasks (network requests, database queries, file reading). Use Multiprocessing for CPU-bound tasks (encryption, image processing, heavy math).'
      }
    ]
  },

  race_conditions_locks: {
    resources: [
      {
        title: 'Mutex vs Semaphore in Operating Systems',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/mutex-vs-semaphore/',
        type: 'Tutorial Guide',
        duration: '9 min read',
        difficulty: 'Intermediate',
        summary: 'Clear breakdown of lock ownership (Mutex) vs signaling counters (Counting & Binary Semaphores).'
      },
      {
        title: 'Deadlock Conditions and Prevention in OS',
        platform: 'TutorialsPoint',
        url: 'https://www.tutorialspoint.com/operating_system/os_deadlocks.htm',
        type: 'Interview Reference',
        duration: '7 min read',
        difficulty: 'Intermediate',
        summary: 'The 4 Coffman conditions for deadlocks: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.'
      }
    ],
    interviewQuestions: [
      {
        q: 'What is a Race Condition?',
        a: 'A race condition occurs when multiple threads concurrently read and write shared data, and the final state depends on the non-deterministic timing of execution.'
      }
    ]
  },

  indexing_b_trees: {
    resources: [
      {
        title: 'Database Indexing: B-Trees & B+Trees Explained',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/b-tree-set-1-introduction-2/',
        type: 'Tutorial Guide',
        duration: '10 min read',
        difficulty: 'Intermediate',
        summary: 'Why databases use multi-way balanced search trees to minimize disk I/O seek operations for lookups and range scans.'
      },
      {
        title: 'SQL CREATE INDEX Statement & Performance',
        platform: 'W3Schools',
        url: 'https://www.w3schools.com/sql/sql_create_index.asp',
        type: 'Interactive Sandbox',
        duration: '6 min read',
        difficulty: 'Beginner',
        summary: 'Syntax for unique and composite indexes and when NOT to index high-churn columns.'
      }
    ],
    interviewQuestions: [
      {
        q: 'Why are B+Trees preferred over standard Binary Search Trees for disk storage?',
        a: 'B+Trees have high branching factors (wide nodes), reducing the tree height to 3-4 levels, requiring only 3-4 disk page reads for billions of records.'
      }
    ]
  },

  redis_key_value: {
    resources: [
      {
        title: 'Redis In-Memory Database & Data Structures',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/redis-data-types/',
        type: 'Tutorial Guide',
        duration: '8 min read',
        difficulty: 'Beginner',
        summary: 'Strings, Lists, Sets, Hashes, and Sorted Sets in Redis with time complexity explanations.'
      },
      {
        title: 'Redis Caching & Key Expiration Patterns',
        platform: 'TutorialsPoint',
        url: 'https://www.tutorialspoint.com/redis/index.htm',
        type: 'Interactive Guide',
        duration: '7 min read',
        difficulty: 'Beginner',
        summary: 'Setting TTLs, LRU eviction policies, and cache-aside query architectures.'
      }
    ],
    interviewQuestions: [
      {
        q: 'Why is Redis so fast even though it is single-threaded?',
        a: 'It holds all data in RAM, uses non-blocking event-driven I/O multiplexing, and eliminates thread context-switch locking overhead.'
      }
    ]
  },

  jwt_token_auth: {
    resources: [
      {
        title: 'JSON Web Token (JWT) Architecture Explained',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/json-web-token-jwt/',
        type: 'Tutorial Guide',
        duration: '7 min read',
        difficulty: 'Beginner',
        summary: 'Structure of Header, Payload, and Signature, and how stateless authentication verifies identity with HMAC/RSA.'
      },
      {
        title: 'JWT Authentication Guide & Best Practices',
        platform: 'freeCodeCamp',
        url: 'https://www.freecodecamp.org/news/how-to-sign-and-validate-json-web-tokens/',
        type: 'Practical Guide',
        duration: '9 min read',
        difficulty: 'Intermediate',
        summary: 'Storing tokens in HttpOnly cookies vs localStorage, token expiry, and refresh token rotation.'
      }
    ],
    interviewQuestions: [
      {
        q: 'Can a user read the contents of a JWT payload?',
        a: 'Yes. The payload is only base64-encoded, not encrypted. Sensitive data like passwords or credit cards should never be placed in a JWT payload.'
      }
    ]
  },

  docker_containerization: {
    resources: [
      {
        title: 'Docker Architecture & Container Basics',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/introduction-to-docker/',
        type: 'Tutorial Guide',
        duration: '8 min read',
        difficulty: 'Beginner',
        summary: 'Understanding Docker Images, Containers, Registries, and Linux kernel namespaces/cgroups.'
      },
      {
        title: 'Writing Efficient Dockerfiles & Multi-Stage Builds',
        platform: 'W3Schools',
        url: 'https://www.w3schools.com/git/',
        type: 'Interactive Guide',
        duration: '6 min read',
        difficulty: 'Beginner',
        summary: 'Layer caching, minimal base images (Alpine/Slim), and reducing container image sizes.'
      }
    ],
    interviewQuestions: [
      {
        q: 'What is the difference between a Docker Image and a Docker Container?',
        a: 'An Image is a static, read-only template with application code and dependencies. A Container is a running instance of an image with a writable layer.'
      }
    ]
  },

  // =========================================================================
  // 2. PYTHON FUNDAMENTALS
  // =========================================================================
  python_syntax_variables: {
    resources: [
      {
        title: 'Python Variables and Data Types',
        platform: 'W3Schools',
        url: 'https://www.w3schools.com/python/python_variables.asp',
        type: 'Interactive Sandbox',
        duration: '6 min read',
        difficulty: 'Beginner',
        summary: 'Integers, floats, strings, booleans, type casting, and dynamic typing in Python.'
      },
      {
        title: 'Python Variables and Object References',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/python-variables/',
        type: 'Tutorial Guide',
        duration: '7 min read',
        difficulty: 'Beginner',
        summary: 'How variables in Python act as memory references/pointers to heap-allocated objects.'
      }
    ],
    interviewQuestions: [
      {
        q: 'What is the difference between mutable and immutable data types in Python?',
        a: 'Immutable types (int, float, str, tuple) cannot be changed after creation. Mutable types (list, dict, set) can be modified in place without changing memory address.'
      }
    ]
  },

  decorators_and_closures: {
    resources: [
      {
        title: 'Python Decorators Step-by-Step Tutorial',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/decorators-in-python/',
        type: 'Tutorial Guide',
        duration: '8 min read',
        difficulty: 'Intermediate',
        summary: 'First-class functions, inner wrappers, @syntax, and passing arguments with *args and **kwargs.'
      },
      {
        title: 'Python Closures and Scope Retention',
        platform: 'TutorialsPoint',
        url: 'https://www.tutorialspoint.com/python/python_closures.htm',
        type: 'Conceptual Guide',
        duration: '6 min read',
        difficulty: 'Intermediate',
        summary: 'How inner functions retain access to variables in their enclosing lexical scope even after the outer function finishes.'
      }
    ],
    interviewQuestions: [
      {
        q: 'Why do we use functools.wraps inside custom decorators?',
        a: 'To preserve the original function name, docstring, and metadata that would otherwise be replaced by the inner wrapper function.'
      }
    ]
  },

  iterators_and_generators: {
    resources: [
      {
        title: 'Python Generators & Yield Keyword',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/generators-in-python/',
        type: 'Tutorial Guide',
        duration: '8 min read',
        difficulty: 'Intermediate',
        summary: 'Creating memory-efficient lazy streams that yield items on demand with O(1) memory consumption.'
      },
      {
        title: 'Python Iterators (__iter__ and __next__)',
        platform: 'W3Schools',
        url: 'https://www.w3schools.com/python/python_iterators.asp',
        type: 'Interactive Guide',
        duration: '5 min read',
        difficulty: 'Beginner',
        summary: 'The iterator protocol and how Python for-loops work under the hood.'
      }
    ],
    interviewQuestions: [
      {
        q: 'What is the memory advantage of a Generator over a List in Python?',
        a: 'A list loads all million elements into RAM simultaneously. A generator computes elements one at a time on-demand, keeping RAM usage constant at O(1).'
      }
    ]
  },

  // =========================================================================
  // 3. WEB BASICS
  // =========================================================================
  html_semantic_markup: {
    resources: [
      {
        title: 'HTML5 Semantic Elements Guide',
        platform: 'W3Schools',
        url: 'https://www.w3schools.com/html/html5_semantic_elements.asp',
        type: 'Interactive Guide',
        duration: '6 min read',
        difficulty: 'Beginner',
        summary: 'Header, Nav, Section, Article, Aside, and Footer elements for accessibility and SEO.'
      },
      {
        title: 'Semantic HTML Structure & Screen Readers',
        platform: 'MDN Web Docs',
        url: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics',
        type: 'Standard Reference',
        duration: '7 min read',
        difficulty: 'Beginner',
        summary: 'Why using semantic tags improves browser rendering speed and assistive accessibility.'
      }
    ],
    interviewQuestions: [
      {
        q: 'Why should you prefer <article> over generic <div> tags?',
        a: '<article> explicitly communicates self-contained content to web browsers, search engine web crawlers, and screen readers.'
      }
    ]
  },

  css_flexbox: {
    resources: [
      {
        title: 'CSS Flexbox Complete Guide & Playground',
        platform: 'W3Schools',
        url: 'https://www.w3schools.com/css/css3_flexbox.asp',
        type: 'Interactive Sandbox',
        duration: '8 min read',
        difficulty: 'Beginner',
        summary: 'justify-content, align-items, flex-direction, flex-wrap, and flex-grow properties.'
      },
      {
        title: 'Flexbox Layout Explained Visually',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/css-flexbox/',
        type: 'Tutorial Guide',
        duration: '7 min read',
        difficulty: 'Beginner',
        summary: '1-Dimensional axis alignment, space distribution, and centering tricks.'
      }
    ],
    interviewQuestions: [
      {
        q: 'What is the difference between justify-content and align-items?',
        a: 'justify-content aligns items along the Main Axis (horizontal by default). align-items aligns items along the Cross Axis (vertical by default).'
      }
    ]
  },

  css_grid: {
    resources: [
      {
        title: 'CSS Grid Layout Module Tutorial',
        platform: 'W3Schools',
        url: 'https://www.w3schools.com/css/css_grid.asp',
        type: 'Interactive Sandbox',
        duration: '8 min read',
        difficulty: 'Beginner',
        summary: 'grid-template-columns, grid-template-rows, gap, repeat(), and minmax() fractional units.'
      },
      {
        title: 'CSS Grid vs Flexbox: When to use which?',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/difference-between-css-grid-and-css-flexbox/',
        type: 'Comparative Guide',
        duration: '6 min read',
        difficulty: 'Beginner',
        summary: 'Use Flexbox for 1D navigation clusters; use Grid for 2D bento card layouts.'
      }
    ],
    interviewQuestions: [
      {
        q: 'What is the purpose of the 1fr fractional unit in CSS Grid?',
        a: '1fr represents one fraction of the available free space in the grid container after fixed pixel elements are allocated.'
      }
    ]
  },

  promises_async_await: {
    resources: [
      {
        title: 'JavaScript Promises and Async/Await',
        platform: 'W3Schools',
        url: 'https://www.w3schools.com/js/js_promise.asp',
        type: 'Interactive Sandbox',
        duration: '7 min read',
        difficulty: 'Beginner',
        summary: 'Pending, Fulfilled, and Rejected promise states with .then() vs async/await syntax.'
      },
      {
        title: 'Promises, Microtasks, and Event Loop',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/javascript-promises/',
        type: 'Tutorial Guide',
        duration: '8 min read',
        difficulty: 'Intermediate',
        summary: 'Promise.all vs Promise.allSettled and robust try/catch error handling.'
      }
    ],
    interviewQuestions: [
      {
        q: 'What happens if one promise rejects inside Promise.all()?',
        a: 'Promise.all rejects immediately with that error (fail-fast). Use Promise.allSettled if you want all promises to complete regardless of failures.'
      }
    ]
  },

  // =========================================================================
  // 4. DATA ANALYSIS
  // =========================================================================
  numpy_ndarray_basics: {
    resources: [
      {
        title: 'NumPy Arrays & Vectorization Tutorial',
        platform: 'W3Schools',
        url: 'https://www.w3schools.com/python/numpy/numpy_intro.asp',
        type: 'Interactive Sandbox',
        duration: '6 min read',
        difficulty: 'Beginner',
        summary: 'Creating 1D and 2D ndarrays, checking shapes, dtypes, and array slicing.'
      },
      {
        title: 'NumPy Ndarray Fundamentals & Speed',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/python-numpy/',
        type: 'Tutorial Guide',
        duration: '8 min read',
        difficulty: 'Beginner',
        summary: 'Why C-contiguous memory arrays in NumPy run 50x faster than standard Python lists.'
      }
    ],
    interviewQuestions: [
      {
        q: 'Why is NumPy array computation faster than standard Python list iterations?',
        a: 'NumPy stores elements in contiguous memory blocks with homogeneous types, allowing CPU SIMD vector instructions and eliminating Python per-element type checking.'
      }
    ]
  },

  pandas_series_dataframes: {
    resources: [
      {
        title: 'Pandas DataFrames and Series Basics',
        platform: 'W3Schools',
        url: 'https://www.w3schools.com/python/pandas/pandas_dataframes.asp',
        type: 'Interactive Sandbox',
        duration: '7 min read',
        difficulty: 'Beginner',
        summary: 'Loading CSVs, inspecting .head(), .info(), and .describe() summary statistics.'
      },
      {
        title: 'Pandas DataFrame Indexing & Selection',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/pandas-tutorial/',
        type: 'Tutorial Guide',
        duration: '9 min read',
        difficulty: 'Beginner',
        summary: 'Label-based selection (.loc) vs integer position-based selection (.iloc).'
      }
    ],
    interviewQuestions: [
      {
        q: 'What is the difference between df.loc and df.iloc in Pandas?',
        a: '.loc accesses rows and columns by their labels/names. .iloc accesses them by their zero-based integer index positions.'
      }
    ]
  },

  pandas_groupby_aggregations: {
    resources: [
      {
        title: 'Pandas GroupBy: Split, Apply, Combine Guide',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/pandas-groupby/',
        type: 'Tutorial Guide',
        duration: '8 min read',
        difficulty: 'Intermediate',
        summary: 'Aggregating columns using .mean(), .sum(), .count(), and custom multi-aggregations with .agg().'
      },
      {
        title: 'Pandas GroupBy Examples & Use Cases',
        platform: 'W3Schools',
        url: 'https://www.w3schools.com/python/pandas/pandas_dataframes.asp',
        type: 'Interactive Sandbox',
        duration: '6 min read',
        difficulty: 'Beginner',
        summary: 'Filtering subsets after grouping and reshaping grouped summaries.'
      }
    ],
    interviewQuestions: [
      {
        q: 'What is the "Split-Apply-Combine" strategy in Pandas?',
        a: '1. Split the DataFrame into groups based on keys; 2. Apply an aggregation or transformation function to each group; 3. Combine results into a new summary DataFrame.'
      }
    ]
  }
};

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
      summary: `Clean step-by-step tutorial with code examples, syntax breakdown, and practical use cases for ${label}.`
    },
    {
      title: `W3Schools: ${label} Reference Guide`,
      platform: 'W3Schools',
      url: `https://www.w3schools.com/tags/ref_byfunc.asp`,
      type: 'Interactive Sandbox',
      duration: '6 min read',
      difficulty: 'Beginner',
      summary: `Try-it-yourself code examples and key terminology cheat-sheet for ${label}.`
    },
    {
      title: `TutorialsPoint: ${label} Concepts`,
      platform: 'TutorialsPoint',
      url: `https://www.tutorialspoint.com/index.htm`,
      type: 'Interview Reference',
      duration: '7 min read',
      difficulty: 'Intermediate',
      summary: `Quick revision summary and common pitfalls to avoid when implementing ${label}.`
    }
  ];
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
