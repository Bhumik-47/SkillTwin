import { AssessmentQuestion } from '../../lib/types';

/**
 * SkillTwin Elite Advanced Challenge Question Bank (BKT Mastery >= 0.90 / 0.95)
 * Covers the first 5 chapters for all 4 core domains (20 skills total).
 * Specially designed for high-performing learners who unlocked Level 4 Pro Mastery.
 */

export const ADVANCED_PRO_QUESTIONS_MAP: Record<string, AssessmentQuestion[]> = {
  // =========================================================================
  // DOMAIN 1: Backend Engineering & Distributed Systems
  // =========================================================================
  http_basics: [
    {
      id: "q_http_adv_1",
      skill_id: "http_basics",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 Advanced HTTP/3 Architecture: HTTP/3 moves away from TCP and uses QUIC over UDP, enabling 0-RTT handshakes and native stream independence.",
      hint: "What happens during network handover (e.g. WiFi to 5G) when using QUIC Connection IDs?",
      prompt: "How does HTTP/3 (QUIC) prevent connection drops and Head-of-Line blocking when a mobile client shifts from WiFi to LTE?",
      options: [
        {
          id: "a",
          text: "QUIC uses 64-bit Connection IDs rather than 4-tuple IP/Port bindings, maintaining the encryption state across network interface transitions without renegotiating handshakes.",
          is_correct: true,
          explanation: "Correct! QUIC abstracts the session with Connection IDs, allowing zero-disruption migration between IP addresses and wireless networks."
        },
        {
          id: "b",
          text: "QUIC opens fallback TCP sockets on all available network cards simultaneously.",
          is_correct: false,
          explanation: "QUIC operates purely over UDP and does not fall back to redundant parallel TCP sockets."
        },
        {
          id: "c",
          text: "QUIC stores unacknowledged packets on intermediate DNS resolver caches.",
          is_correct: false,
          explanation: "DNS resolvers do not cache transport layer packets."
        },
        {
          id: "d",
          text: "QUIC forces all TCP RST packets to be silently dropped by local firewalls.",
          is_correct: false,
          explanation: "QUIC runs over UDP; TCP RST packets are irrelevant."
        }
      ]
    },
    {
      id: "q_http_adv_2",
      skill_id: "http_basics",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 Zero-RTT Replay Attack Vulnerability: In HTTP 0-RTT early data, requests can be captured and replayed by malicious interceptors.",
      hint: "Which HTTP methods are safe to include in 0-RTT early data packets?",
      prompt: "Why should non-idempotent HTTP requests (like POST /api/payment/checkout) NEVER be accepted in TLS 1.3 / HTTP/3 0-RTT Early Data?",
      options: [
        {
          id: "a",
          text: "Because 0-RTT packets lack anti-replay protection, allowing an on-path attacker to duplicate transactions before the full cryptographic handshake completes.",
          is_correct: true,
          explanation: "Correct! 0-RTT Early Data is vulnerable to replay attacks. Only idempotent requests (GET, HEAD) should ever be serviced in 0-RTT."
        },
        {
          id: "b",
          text: "Because 0-RTT early data is sent in unencrypted plaintext over the wire.",
          is_correct: false,
          explanation: "0-RTT data is encrypted using pre-shared keys (PSK), but lacks forward secrecy and replay protection."
        },
        {
          id: "c",
          text: "Because 0-RTT packets are strictly limited to 64 bytes total length.",
          is_correct: false,
          explanation: "0-RTT payloads can be kilobytes, though limits vary by server."
        },
        {
          id: "d",
          text: "Because WebSockets automatically override all 0-RTT headers.",
          is_correct: false,
          explanation: "WebSockets establish after standard HTTP upgrades, not related to 0-RTT replay safety."
        }
      ]
    }
  ],

  tcp_ip_sockets: [
    {
      id: "q_tcp_adv_1",
      skill_id: "tcp_ip_sockets",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 Socket State Architecture: Under extreme connection loads, sockets in TIME_WAIT state can deplete ephemeral port ranges.",
      hint: "What kernel setting allows reusing sockets in TIME_WAIT for outgoing connections?",
      prompt: "When designing high-throughput microservices handling 50,000 requests/second, what architectural risk does the TIME_WAIT socket state pose, and how is it mitigated?",
      options: [
        {
          id: "a",
          text: "It causes Ephemeral Port Exhaustion on the client/proxy side; mitigated by enabling HTTP connection pooling (Keep-Alive) and tcp_tw_reuse at the kernel level.",
          is_correct: true,
          explanation: "Correct! TIME_WAIT lasts 2*MSL (60-120s). Without connection pooling, opening rapid short-lived connections exhausts the 65,535 ephemeral port range."
        },
        {
          id: "b",
          text: "It leaks OS kernel file descriptors into user-space heap memory.",
          is_correct: false,
          explanation: "TIME_WAIT is a valid TCP state tracked by kernel tables, not a user-space memory leak."
        },
        {
          id: "c",
          text: "It corrupts the Ethernet MTU packet size down to 576 bytes.",
          is_correct: false,
          explanation: "MTU is negotiated during path MTU discovery, unaffected by TIME_WAIT."
        },
        {
          id: "d",
          text: "It permanently locks the CPU cores to interrupt handling mode.",
          is_correct: false,
          explanation: "TIME_WAIT sockets are passive state machine timers, not CPU-bound spins."
        }
      ]
    },
    {
      id: "q_tcp_adv_2",
      skill_id: "tcp_ip_sockets",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 Congestion Control Engineering: Modern high-bandwidth networks use Google BBR (Bottleneck Bandwidth and RTT) instead of loss-based Cubic.",
      hint: "How does BBR differentiate between packet loss and bufferbloat congestion?",
      prompt: "How does BBR Congestion Control maximize throughput on long-haul cloud networks compared to traditional loss-based Cubic algorithms?",
      options: [
        {
          id: "a",
          text: "By modeling the actual bandwidth-delay product (BDP) via pacing rate and min-RTT estimates rather than halving transmission windows on random packet loss.",
          is_correct: true,
          explanation: "Correct! BBR measures maximum delivery rate and minimum round-trip time, preventing throughput collapse over lossy wireless or long-distance backbones."
        },
        {
          id: "b",
          text: "By disabling all TCP ACK acknowledgments to reduce bandwidth overhead.",
          is_correct: false,
          explanation: "TCP strictly requires ACKs for sequence tracking; BBR does not disable ACKs."
        },
        {
          id: "c",
          text: "By compressing all TCP headers using Gzip at the network driver level.",
          is_correct: false,
          explanation: "TCP headers are framed in binary, not compressed via Gzip."
        },
        {
          id: "d",
          text: "By dynamically increasing the TCP window size to infinite memory.",
          is_correct: false,
          explanation: "Window sizes are bounded by kernel socket buffer limits (SO_RCVBUF / SO_SNDBUF)."
        }
      ]
    }
  ],

  dns_resolution: [
    {
      id: "q_dns_adv_1",
      skill_id: "dns_resolution",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 Anycast DNS & Latency Routing: Global CDN infrastructure relies on BGP Anycast to direct user queries to the nearest POP.",
      hint: "What happens when multiple edge nodes broadcast the exact same IP address via BGP?",
      prompt: "How does Anycast BGP DNS routing route a client in Tokyo to a local Tokyo nameserver while a client in London hits London using the exact same IP address?",
      options: [
        {
          id: "a",
          text: "Multiple geographically distributed datacenters announce identical IP prefixes over BGP; upstream ISPs automatically route packets along the shortest AS-Path hop.",
          is_correct: true,
          explanation: "Correct! Anycast leverages BGP routing metrics to route packets to the topologically closest edge node sharing that IP."
        },
        {
          id: "b",
          text: "The DNS client's browser computes GPS coordinates and writes them into the IP header.",
          is_correct: false,
          explanation: "GPS coordinates are not written to IP packets; routing is governed by BGP."
        },
        {
          id: "c",
          text: "The central root DNS server manually redirects each packet using HTTP 301.",
          is_correct: false,
          explanation: "DNS operates on UDP/TCP port 53 and does not use HTTP redirects."
        },
        {
          id: "d",
          text: "Every ISP maintains a synchronized SQL database of user location coordinates.",
          is_correct: false,
          explanation: "BGP routing tables operate on autonomous system paths (AS-Path), not relational databases."
        }
      ]
    }
  ],

  tls_ssl_handshake: [
    {
      id: "q_tls_adv_1",
      skill_id: "tls_ssl_handshake",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 TLS 1.3 Cryptographic Improvements: TLS 1.3 removed legacy static RSA key exchange in favor of Ephemeral Diffie-Hellman (ECDHE).",
      hint: "Why is Ephemeral key exchange required for Perfect Forward Secrecy (PFS)?",
      prompt: "Why does TLS 1.3 mandate Ephemeral Diffie-Hellman (ECDHE) and ban static RSA key exchange for session encryption?",
      options: [
        {
          id: "a",
          text: "To ensure Perfect Forward Secrecy (PFS); even if the server's long-term private key is leaked in the future, past recorded encrypted traffic cannot be decrypted.",
          is_correct: true,
          explanation: "Correct! With ECDHE, session keys are ephemeral and discarded after the connection closes, protecting past sessions from retroactive decryption."
        },
        {
          id: "b",
          text: "Because RSA certificates cannot support domain names longer than 16 characters.",
          is_correct: false,
          explanation: "RSA certificates support full standard FQDN lengths."
        },
        {
          id: "c",
          text: "Because static RSA requires an active UDP broadcast channel.",
          is_correct: false,
          explanation: "TLS operates over reliable byte streams, not UDP broadcasts."
        },
        {
          id: "d",
          text: "Because ECDHE eliminates the need for any Certificate Authority verification.",
          is_correct: false,
          explanation: "Certificates are still required for server authentication."
        }
      ]
    }
  ],

  concurrency_models: [
    {
      id: "q_conc_adv_1",
      skill_id: "concurrency_models",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 Linux Epoll vs Thread-per-Core Architecture: Scaling to millions of concurrent WebSockets (C10M) requires non-blocking event notification.",
      hint: "Why does thread-per-connection fail at 100,000+ connections?",
      prompt: "Why do high-performance servers (Nginx, Node.js, Envoy) use Epoll / Kqueue non-blocking I/O event loops instead of spawning an OS thread per connection?",
      options: [
        {
          id: "a",
          text: "Because spawning 100,000 threads causes catastrophic memory overhead (stack allocation per thread) and CPU thrashing due to continuous OS kernel context switching.",
          is_correct: true,
          explanation: "Correct! Each OS thread consumes 1-8MB of stack memory and heavy context-switch penalties. Epoll uses O(1) event-readiness notifications across thousands of file descriptors on a single thread."
        },
        {
          id: "b",
          text: "Because OS threads cannot perform network write operations simultaneously.",
          is_correct: false,
          explanation: "OS threads can write concurrently, but scale poorly due to memory and scheduling overhead."
        },
        {
          id: "c",
          text: "Because Epoll automatically runs on GPU compute shaders.",
          is_correct: false,
          explanation: "Epoll is a Linux kernel system call for CPU network polling."
        },
        {
          id: "d",
          text: "Because non-blocking sockets execute without using CPU clock cycles.",
          is_correct: false,
          explanation: "Event loops still consume CPU cycles to dispatch ready I/O events."
        }
      ]
    }
  ],

  // =========================================================================
  // DOMAIN 2: Python Fundamentals
  // =========================================================================
  py_variables_datatypes: [
    {
      id: "q_py_var_adv_1",
      skill_id: "py_variables_datatypes",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 CPython Memory Internals: CPython implements small integer interning for numbers from -5 to 256 and memory recycling via PyObject.",
      hint: "What happens when using the identity operator `is` versus equality `==` on integers?",
      prompt: "In standard CPython, why does `a = 256; b = 256; a is b` evaluate to True, but `x = 257; y = 257; x is y` in interactive REPL evaluates to False?",
      options: [
        {
          id: "a",
          text: "CPython pre-allocates an array of singleton integer objects for values in range [-5, 256] at interpreter boot; integers outside this range allocate fresh PyObject instances.",
          is_correct: true,
          explanation: "Correct! CPython interns small integers (-5 to 256) as shared singletons in memory, so identity `is` compares the exact same memory address."
        },
        {
          id: "b",
          text: "Because integers greater than 256 automatically cast into 64-bit IEEE floating-point numbers.",
          is_correct: false,
          explanation: "Python integers have arbitrary precision and do not cast to floats."
        },
        {
          id: "c",
          text: "Because the `is` operator only works on single-byte binary data.",
          is_correct: false,
          explanation: "`is` checks object memory identity (`id(a) == id(b)`)."
        },
        {
          id: "d",
          text: "Because Python's Garbage Collector deletes variables named `x` and `y` immediately.",
          is_correct: false,
          explanation: "GC does not delete variables based on their identifier names."
        }
      ]
    }
  ],

  py_control_flow: [
    {
      id: "q_py_ctrl_adv_1",
      skill_id: "py_control_flow",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 Structural Pattern Matching (PEP 634): `match ... case` in Python 3.10+ performs deep destructuring and value binding.",
      hint: "What happens when you use a bare variable name in a case clause?",
      prompt: "In Python's `match...case` construct, what is the critical difference between `case Point(x, y):` and `case [x, y] if x == y:`?",
      options: [
        {
          id: "a",
          text: "The first performs class attribute pattern destructuring verifying `isinstance(val, Point)`, while the second matches sequence length and evaluates a conditional guard.",
          is_correct: true,
          explanation: "Correct! Class pattern matching inspects `__match_args__` on classes, while sequence patterns match list/tuple structures with boolean guards."
        },
        {
          id: "b",
          text: "The first runs synchronously; the second compiles to an asynchronous coroutine.",
          is_correct: false,
          explanation: "Pattern matching is purely synchronous control flow."
        },
        {
          id: "c",
          text: "The second clause causes a runtime SyntaxError in Python 3.11.",
          is_correct: false,
          explanation: "`case ... if` guards are valid syntax in Python 3.10+."
        },
        {
          id: "d",
          text: "The first clause converts all numbers into strings.",
          is_correct: false,
          explanation: "Class matching does not mutate data types."
        }
      ]
    }
  ],

  py_functions_scope: [
    {
      id: "q_py_func_adv_1",
      skill_id: "py_functions_scope",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 Late Binding Closures: Functions defined inside a loop bind to the variable name in the enclosing scope, not the value at creation time.",
      hint: "What is the standard idiom (default parameter `i=i`) to capture the loop variable immediately?",
      prompt: "What will `[f() for f in [lambda: i for i in range(4)]]` evaluate to, and why?",
      options: [
        {
          id: "a",
          text: "[3, 3, 3, 3] — because Python closures use late binding and look up `i` in the outer scope when called, at which point `i` has terminated at 3.",
          is_correct: true,
          explanation: "Correct! Python closures look up variables when executed, not when defined. To bind immediately, use `lambda i=i: i`."
        },
        {
          id: "b",
          text: "[0, 1, 2, 3] — because lambdas create immutable stack frames on every iteration.",
          is_correct: false,
          explanation: "Lambdas look up the shared enclosing scope variable `i` at call time."
        },
        {
          id: "c",
          text: "[0, 0, 0, 0] — because lambdas freeze their initial scope values.",
          is_correct: false,
          explanation: "Variables are not frozen unless captured via default arguments."
        },
        {
          id: "d",
          text: "A runtime UnboundLocalError exception.",
          is_correct: false,
          explanation: "The variable `i` is defined in the comprehension scope."
        }
      ]
    }
  ],

  py_data_structures: [
    {
      id: "q_py_ds_adv_1",
      skill_id: "py_data_structures",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 CPython Compact Dict Hash Table: Python 3.6+ uses a compact hash table layout with separate index arrays and entry arrays.",
      hint: "How did Python make dictionaries insertion-ordered while reducing memory consumption by 30%?",
      prompt: "How does CPython's compact dictionary implementation achieve guaranteed insertion ordering and reduced memory overhead?",
      options: [
        {
          id: "a",
          text: "By storing key-value pairs in a dense contiguous array in insertion order, while a sparse hash indices array stores integer pointers into the dense array.",
          is_correct: true,
          explanation: "Correct! The hash table stores sparse indices (1, 2, or 4 bytes) pointing to a dense array of `[hash, key, value]`, preserving insertion order and saving memory."
        },
        {
          id: "b",
          text: "By maintaining a doubly linked list pointer inside every dictionary item struct.",
          is_correct: false,
          explanation: "Linked lists were used in OrderedDict, but compact dict replaced this with dense/sparse arrays."
        },
        {
          id: "c",
          text: "By sorting keys alphabetically in binary search trees upon every write.",
          is_correct: false,
          explanation: "Dictionaries use hash tables, not sorted binary trees."
        },
        {
          id: "d",
          text: "By offloading dictionary lookups to SQLite memory tables.",
          is_correct: false,
          explanation: "Dicts are native CPython C structs in memory."
        }
      ]
    }
  ],

  py_oop_classes: [
    {
      id: "q_py_oop_adv_1",
      skill_id: "py_oop_classes",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 C3 Linearization & MRO: Python uses the C3 Linearization algorithm to determine Method Resolution Order in multiple inheritance.",
      hint: "How does `super()` determine which class to invoke next in the hierarchy?",
      prompt: "When calling `super().method()` in a class with diamond multiple inheritance, what determines the exact execution order?",
      options: [
        {
          id: "a",
          text: "The C3 Linearization algorithm computes the class's `__mro__` at class definition time, ensuring monotonic ordering and single-evaluation of common base classes.",
          is_correct: true,
          explanation: "Correct! Python uses C3 MRO to compute a strict, monotonic method resolution order that visits each base class once without conflicts."
        },
        {
          id: "b",
          text: "The method is dispatched randomly across all parent classes concurrently.",
          is_correct: false,
          explanation: "MRO is deterministic and single-threaded."
        },
        {
          id: "c",
          text: "The first parent class listed in the definition always overrides all others recursively.",
          is_correct: false,
          explanation: "C3 Linearization considers the entire class hierarchy, not just the first parent."
        },
        {
          id: "d",
          text: "Classes must be annotated with `@abstractmethod` for `super()` to work.",
          is_correct: false,
          explanation: "`super()` works across all standard Python classes."
        }
      ]
    }
  ],

  // =========================================================================
  // DOMAIN 3: Web Basics (HTML/CSS/JS)
  // =========================================================================
  html_semantic_structure: [
    {
      id: "q_html_adv_1",
      skill_id: "html_semantic_structure",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 Accessibility Tree & ARIA Roles: Screen readers build an Accessibility Object Model (AOM) from semantic HTML elements.",
      hint: "Why should native elements be preferred over `role=` attributes?",
      prompt: "According to the First Rule of ARIA (W3C), why is `<button>` preferred over `<div role='button' tabindex='0'>`?",
      options: [
        {
          id: "a",
          text: "Native `<button>` elements inherently support keyboard activation (Enter & Space), disabled state propagation, and focus management across all assistive technologies without custom JS.",
          is_correct: true,
          explanation: "Correct! Native HTML elements have built-in accessibility semantics, focus handling, and keyboard event dispatch that must otherwise be manually coded for ARIA divs."
        },
        {
          id: "b",
          text: "Because `role='button'` is deprecated in HTML5.",
          is_correct: false,
          explanation: "ARIA roles are actively supported, but native elements are preferred."
        },
        {
          id: "c",
          text: "Because `<div>` tags cannot render CSS border-radius.",
          is_correct: false,
          explanation: "CSS styles work on all HTML elements."
        },
        {
          id: "d",
          text: "Because search engines penalize websites using `role` attributes.",
          is_correct: false,
          explanation: "ARIA attributes do not trigger search engine penalties."
        }
      ]
    }
  ],

  css_box_model: [
    {
      id: "q_css_adv_1",
      skill_id: "css_box_model",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 CSS Container Queries (`@container`): Container queries evaluate styles based on the parent component's size rather than the global viewport.",
      hint: "What property must be declared on the parent element to enable container queries?",
      prompt: "How does `container-type: inline-size` change modular responsive component design compared to traditional `@media` viewport queries?",
      options: [
        {
          id: "a",
          text: "It enables micro-components to adapt their layout dynamically based on the exact width of their immediate container, allowing the same component to render differently in sidebars vs main content.",
          is_correct: true,
          explanation: "Correct! Container queries allow responsive component architecture independent of screen resolution or viewport dimensions."
        },
        {
          id: "b",
          text: "It compiles all CSS into WebAssembly bytecodes for faster GPU rasterization.",
          is_correct: false,
          explanation: "CSS is parsed and computed by the browser layout engine, not compiled to Wasm."
        },
        {
          id: "c",
          text: "It replaces CSS Flexbox and Grid with SVG vectors.",
          is_correct: false,
          explanation: "Container queries work directly with Flexbox and Grid."
        },
        {
          id: "d",
          text: "It disables all CSS margins and paddings globally.",
          is_correct: false,
          explanation: "Margins and paddings function normally inside containers."
        }
      ]
    }
  ],

  js_variables_datatypes: [
    {
      id: "q_js_var_adv_1",
      skill_id: "js_variables_datatypes",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 V8 Engine Hidden Classes & Shape Transitions: V8 optimizes object property access by sharing Hidden Classes (Shapes) across objects created with identical structures.",
      hint: "What happens when properties are added to an object in different orders?",
      prompt: "Why does adding dynamic properties to JavaScript objects in different orders (e.g. `obj1.a = 1; obj1.b = 2` vs `obj2.b = 2; obj2.a = 1`) cause performance degradation in V8?",
      options: [
        {
          id: "a",
          text: "It causes Shape Divergence (creating multiple Hidden Classes), triggering Inline Cache (IC) misses and causing V8's TurboFan compiler to deoptimize into slow dictionary mode.",
          is_correct: true,
          explanation: "Correct! V8 uses hidden class transitions. Different property assignment orders create divergent transition trees, breaking monomorphic inline caches."
        },
        {
          id: "b",
          text: "It forces the browser to restart the main JavaScript event loop thread.",
          is_correct: false,
          explanation: "Hidden class transitions affect JIT optimizations, not thread restarts."
        },
        {
          id: "c",
          text: "It permanently disables the Garbage Collector for those objects.",
          is_correct: false,
          explanation: "Garbage collection proceeds normally on all heap objects."
        },
        {
          id: "d",
          text: "It causes an unhandled ReferenceError exception at runtime.",
          is_correct: false,
          explanation: "Different property order is valid JS syntax, but incurs a JIT optimization penalty."
        }
      ]
    }
  ],

  js_dom_manipulation: [
    {
      id: "q_js_dom_adv_1",
      skill_id: "js_dom_manipulation",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 Layout Thrashing & Forced Synchronous Layout: Interleaving DOM reads (e.g. `offsetWidth`) with DOM writes (e.g. `style.width`) forces the browser to recalculate layout repeatedly.",
      hint: "How should DOM reads and writes be grouped in high-performance animations?",
      prompt: "What is 'Layout Thrashing' in web performance, and how is it eliminated in high-framerate 60fps applications?",
      options: [
        {
          id: "a",
          text: "Forced synchronous reflows caused by alternating geometric DOM queries (`offsetTop`) and mutations (`style.height`) in a loop; eliminated by batching all reads first, then writes in `requestAnimationFrame`.",
          is_correct: true,
          explanation: "Correct! When JS queries geometry after a mutation, the browser must immediately recalculate layout synchronously, causing severe frame drops (jank)."
        },
        {
          id: "b",
          text: "When DOM nodes are deleted while CSS transitions are running.",
          is_correct: false,
          explanation: "Deleting nodes cancels transitions but is not layout thrashing."
        },
        {
          id: "c",
          text: "When HTML script tags are placed in the `<head>` without `defer`.",
          is_correct: false,
          explanation: "That is parser-blocking script loading, not layout thrashing."
        },
        {
          id: "d",
          text: "When web fonts fail to load from external CDN servers.",
          is_correct: false,
          explanation: "Font loading causes FOIT/FOUT, not layout thrashing."
        }
      ]
    }
  ],

  js_async_promises: [
    {
      id: "q_js_async_adv_1",
      skill_id: "js_async_promises",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 Event Loop Queues: Microtasks (Promise callbacks, `queueMicrotask`) have higher execution priority and drain completely before the next Macrotask (`setTimeout`).",
      hint: "What is the exact execution order of synchronous code, Microtasks, and Macrotasks?",
      prompt: "What is the exact console output order of the following code?\n```js\nconsole.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');\n```",
      options: [
        {
          id: "a",
          text: "1, 4, 3, 2 — because synchronous code runs first (1, 4), then the Microtask queue drains (3), then the Macrotask queue executes (2).",
          is_correct: true,
          explanation: "Correct! The JS engine executes synchronous code first, drains all pending Microtasks (Promises) before checking the next Macrotask timer (setTimeout)."
        },
        {
          id: "b",
          text: "1, 2, 3, 4 — in the order lines appear in the source code.",
          is_correct: false,
          explanation: "Asynchronous callbacks are scheduled in event loop queues, not executed synchronously."
        },
        {
          id: "c",
          text: "1, 3, 2, 4 — Promise runs before the second console.log.",
          is_correct: false,
          explanation: "Promise.then is a microtask and executes only after the current synchronous call stack finishes."
        },
        {
          id: "d",
          text: "3, 1, 4, 2 — Promises have highest priority over synchronous code.",
          is_correct: false,
          explanation: "Synchronous code always executes first on the call stack."
        }
      ]
    }
  ],

  // =========================================================================
  // DOMAIN 4: Data Analysis with NumPy & Pandas
  // =========================================================================
  py_numpy_arrays: [
    {
      id: "q_np_arr_adv_1",
      skill_id: "py_numpy_arrays",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 NumPy Strides & Memory Layout: NumPy ndarrays are strided pointers over flat C-contiguous or Fortran-contiguous memory buffers.",
      hint: "Why is slicing `arr[::2]` O(1) in time and memory?",
      prompt: "How does NumPy create slices and transpositions without copying raw data in memory?",
      options: [
        {
          id: "a",
          text: "By creating a lightweight `ndarray` view struct with modified `strides` and `shape` metadata referencing the exact same underlying shared data buffer.",
          is_correct: true,
          explanation: "Correct! NumPy slicing returns a view by altering the stride step byte offset, achieving O(1) instantaneous slicing without memory allocations."
        },
        {
          id: "b",
          text: "By running an asynchronous memcpy background thread in C.",
          is_correct: false,
          explanation: "NumPy views do not copy memory."
        },
        {
          id: "c",
          text: "By compressing the array using Zstandard.",
          is_correct: false,
          explanation: "NumPy arrays exist in raw uncompressed memory buffers."
        },
        {
          id: "d",
          text: "By converting numerical data into Python dictionaries.",
          is_correct: false,
          explanation: "NumPy arrays are C-level buffers, not Python dicts."
        }
      ]
    }
  ],

  py_numpy_vectorization: [
    {
      id: "q_np_vec_adv_1",
      skill_id: "py_numpy_vectorization",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 SIMD Vectorization & In-Place Allocations: Vectorized operations utilize CPU AVX/AVX-512 registers to perform 8 to 16 floating-point calculations per CPU clock cycle.",
      hint: "What parameter avoids allocating temporary arrays in expressions like `np.add(a, b, out=a)`?",
      prompt: "How can data engineers eliminate massive intermediate memory allocations when processing 50GB NumPy arrays in computational pipelines?",
      options: [
        {
          id: "a",
          text: "By utilizing the `out=` parameter in NumPy universal functions (`np.multiply(a, b, out=a)`) to write directly into pre-allocated memory buffers.",
          is_correct: true,
          explanation: "Correct! The `out=` parameter executes in-place operations, preventing Python from allocating new multi-gigabyte temporary arrays."
        },
        {
          id: "b",
          text: "By casting all float64 arrays to float128.",
          is_correct: false,
          explanation: "Increasing precision doubles memory usage."
        },
        {
          id: "c",
          text: "By wrapping operations in Python `try...except` blocks.",
          is_correct: false,
          explanation: "Error handling does not optimize memory allocations."
        },
        {
          id: "d",
          text: "By replacing arrays with Python lists.",
          is_correct: false,
          explanation: "Python lists consume ~4x more memory per element due to PyObject pointers."
        }
      ]
    }
  ],

  py_pandas_series_df: [
    {
      id: "q_pd_df_adv_1",
      skill_id: "py_pandas_series_df",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 Pandas Memory Architecture: Modern Pandas 2.0+ supports Apache Arrow (PyArrow) columnar memory backends alongside traditional NumPy BlockManagers.",
      hint: "Why are PyArrow-backed DataFrames significantly faster on string and nullable columns?",
      prompt: "What major performance and memory benefit does the PyArrow backend introduce to Pandas DataFrames compared to traditional NumPy object arrays?",
      options: [
        {
          id: "a",
          text: "Zero-copy memory sharing with other tools (DuckDB, Polars, Spark), contiguous memory layout for string arrays, and native bitmask-based missing data handling.",
          is_correct: true,
          explanation: "Correct! PyArrow provides native Arrow format memory, eliminating Python object pointer overhead on string columns and enabling zero-copy interoperability."
        },
        {
          id: "b",
          text: "It stores all DataFrame rows in distributed blockchain blocks.",
          is_correct: false,
          explanation: "PyArrow is an in-memory columnar format, not blockchain."
        },
        {
          id: "c",
          text: "It disables all DataFrame indexes permanently.",
          is_correct: false,
          explanation: "Pandas indexes function normally with PyArrow."
        },
        {
          id: "d",
          text: "It automatically compiles Python code to C++ at runtime.",
          is_correct: false,
          explanation: "PyArrow provides C++ memory backends, not JIT code compilation."
        }
      ]
    }
  ],

  py_pandas_data_cleaning: [
    {
      id: "q_pd_clean_adv_1",
      skill_id: "py_pandas_data_cleaning",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 Method Chaining & Categorical Compression: Chaining transformations with `.pipe()` and casting low-cardinality strings to `category` dtype yields dramatic memory reductions.",
      hint: "What happens to memory consumption when a column of 10 million repeated strings is converted to `category`?",
      prompt: "When loading a 10-million row DataFrame with repeated text columns (e.g. 'US', 'UK', 'CA'), why does `df['country'].astype('category')` reduce memory by over 80%?",
      options: [
        {
          id: "a",
          text: "It replaces memory-heavy string pointers with small integer keys (e.g. 8-bit integers) mapping to an internal lookup table containing each unique string only once.",
          is_correct: true,
          explanation: "Correct! Categoricals store an integer code array (1 byte per row) pointing to a tiny unique category index, shrinking memory dramatically."
        },
        {
          id: "b",
          text: "It encrypts the column using AES-256 compression.",
          is_correct: false,
          explanation: "Categoricals use dictionary encoding, not encryption."
        },
        {
          id: "c",
          text: "It deletes 80% of duplicate rows automatically.",
          is_correct: false,
          explanation: "Categoricals preserve every row; they only alter the internal encoding."
        },
        {
          id: "d",
          text: "It converts text strings to floating point numbers.",
          is_correct: false,
          explanation: "Categories are integer coded maps, not floats."
        }
      ]
    }
  ],

  py_pandas_filtering: [
    {
      id: "q_pd_filt_adv_1",
      skill_id: "py_pandas_filtering",
      stage: 4,
      difficulty: "advanced",
      tier: "challenge",
      concept_primer: "💡 High-Performance Filtering with NumExpr: Pandas `.query()` evaluates boolean expressions using NumExpr to avoid intermediate array allocations.",
      hint: "Why is `df.query('A > 0 and B < 10')` faster on 20-million row DataFrames than `df[(df.A > 0) & (df.B < 10)]`?",
      prompt: "Why is `df.query('A > 100 and B < 50')` faster and more memory efficient on massive DataFrames than standard boolean indexing `df[(df['A'] > 100) & (df['B'] < 50)]`?",
      options: [
        {
          id: "a",
          text: "NumExpr compiles the query into multi-threaded bytecode that evaluates expressions in CPU cache chunks without creating full-size intermediate boolean masks in RAM.",
          is_correct: true,
          explanation: "Correct! Standard boolean indexing creates separate full-length memory arrays for each condition before bitwise ANDing them. NumExpr chunks the computation in CPU L1/L2 cache."
        },
        {
          id: "b",
          text: "Because `.query()` converts the DataFrame into a PostgreSQL database in memory.",
          is_correct: false,
          explanation: "NumExpr compiles Python bytecode, not SQL."
        },
        {
          id: "c",
          text: "Because `.query()` bypasses all Python Global Interpreter Lock (GIL) checks.",
          is_correct: false,
          explanation: "NumExpr uses multithreading on array chunks, but does not alter Python's interpreter core."
        },
        {
          id: "d",
          text: "Because `.query()` skips type-checking on all columns.",
          is_correct: false,
          explanation: "Type-checking is performed during AST generation."
        }
      ]
    }
  ]
};
