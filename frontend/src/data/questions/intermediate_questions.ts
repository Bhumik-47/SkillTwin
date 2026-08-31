import { AssessmentQuestion } from '../../lib/types';

/**
 * SkillTwin Intermediate Applied Question Bank
 * Provides 4 curated intermediate-tier questions per skill for core chapters.
 * Focuses on practical engineering decisions, edge cases, and architectural mechanisms.
 */

export const INTERMEDIATE_QUESTIONS_MAP: Record<string, AssessmentQuestion[]> = {
  // =========================================================================
  // DOMAIN 1: Backend Engineering & Distributed Systems
  // =========================================================================
  http_basics: [
    {
      id: "q_http_int_1",
      skill_id: "http_basics",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 HTTP/1.1 Chunked Transfer Encoding: Allows streaming dynamically generated data without knowing total byte length up front.",
      hint: "What header indicates chunked framing?",
      prompt: "When a web server streams dynamically generated data whose total byte length is unknown in advance, which HTTP/1.1 mechanism is used?",
      options: [
        {
          id: "a",
          text: "Transfer-Encoding: chunked",
          is_correct: true,
          explanation: "Correct! Chunked transfer encoding allows sending data as a series of size-prefixed chunks without a prior Content-Length header."
        },
        {
          id: "b",
          text: "Connection: close",
          is_correct: false,
          explanation: "Connection: close closes the TCP socket without chunked framing."
        },
        {
          id: "c",
          text: "Content-Encoding: gzip",
          is_correct: false,
          explanation: "Content-Encoding specifies compression, not transport framing."
        },
        {
          id: "d",
          text: "Cache-Control: no-cache",
          is_correct: false,
          explanation: "Cache-Control governs caching directives."
        }
      ]
    },
    {
      id: "q_http_int_2",
      skill_id: "http_basics",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 HTTP Caching & Conditional Requests: The ETag header enables cache validation using If-None-Match.",
      hint: "Which HTTP status code confirms the cached version is still valid?",
      prompt: "When a client sends an `If-None-Match` header matching the server's current entity tag, what HTTP response status code is returned?",
      options: [
        {
          id: "a",
          text: "304 Not Modified — tells the client to use its local cache without transferring the body",
          is_correct: true,
          explanation: "Correct! 304 Not Modified saves network bandwidth by reusing cached payloads."
        },
        {
          id: "b",
          text: "200 OK with full response body",
          is_correct: false,
          explanation: "200 OK would retransmit the entire payload unnecessarily."
        },
        {
          id: "c",
          text: "412 Precondition Failed",
          is_correct: false,
          explanation: "412 is returned when conditions in If-Match or If-Unmodified-Since fail during mutation requests."
        },
        {
          id: "d",
          text: "204 No Content",
          is_correct: false,
          explanation: "204 is returned when an action succeeded with no body, not for conditional validation."
        }
      ]
    },
    {
      id: "q_http_int_3",
      skill_id: "http_basics",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 HTTP/2 Multiplexing: HTTP/2 frames binary streams over a single connection rather than opening multiple parallel TCP sockets.",
      hint: "How does HTTP/2 prevent HOL blocking at the application level?",
      prompt: "How does HTTP/2 eliminate request-level Head-of-Line (HoL) blocking compared to HTTP/1.1 pipelining?",
      options: [
        {
          id: "a",
          text: "By splitting requests into independent binary frames tagged with Stream IDs and multiplexing them concurrently over one TCP socket",
          is_correct: true,
          explanation: "Correct! HTTP/2 uses binary framing and Stream IDs to interleave requests and responses concurrently."
        },
        {
          id: "b",
          text: "By opening 6 parallel TCP connections for every domain host",
          is_correct: false,
          explanation: "Opening multiple parallel connections was the HTTP/1.1 workaround that HTTP/2 eliminates."
        },
        {
          id: "c",
          text: "By disabling TLS encryption on static assets",
          is_correct: false,
          explanation: "HTTP/2 requires TLS in virtually all browser implementations."
        },
        {
          id: "d",
          text: "By forcing all payloads to use WebSockets",
          is_correct: false,
          explanation: "HTTP/2 is a distinct binary protocol and does not rely on WebSockets."
        }
      ]
    },
    {
      id: "q_http_int_4",
      skill_id: "http_basics",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 HTTP Methods & Idempotency: Idempotent operations produce the exact same outcome on the server regardless of how many times they are executed.",
      hint: "Which method is idempotent for resource updates?",
      prompt: "Why is HTTP `PUT` classified as idempotent while `POST` is generally non-idempotent?",
      options: [
        {
          id: "a",
          text: "Calling `PUT /items/1` multiple times with the same payload replaces the target state identically, whereas repeating `POST /items` creates multiple new items",
          is_correct: true,
          explanation: "Correct! Idempotency guarantees that multiple identical requests leave the server in the exact same state."
        },
        {
          id: "b",
          text: "Because `PUT` runs synchronously and `POST` runs asynchronously in the browser",
          is_correct: false,
          explanation: "Both HTTP methods are handled identically by browser asynchronous dispatch."
        },
        {
          id: "c",
          text: "Because `POST` is encrypted while `PUT` is plaintext",
          is_correct: false,
          explanation: "Encryption is determined by TLS/HTTPS, not the HTTP verb."
        },
        {
          id: "d",
          text: "Because `PUT` cannot transmit JSON bodies",
          is_correct: false,
          explanation: "PUT frequently transmits JSON request bodies."
        }
      ]
    }
  ],

  tcp_ip_sockets: [
    {
      id: "q_tcp_int_1",
      skill_id: "tcp_ip_sockets",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 TCP Connection Teardown & TIME_WAIT: The active closer enters TIME_WAIT to ensure clean packet retirement.",
      hint: "Why does the socket remain in TIME_WAIT for 2 * MSL?",
      prompt: "What is the primary operational reason the socket initiating an active close enters the `TIME_WAIT` state?",
      options: [
        {
          id: "a",
          text: "To guarantee that delayed duplicate packets from the connection drain from the network and ensure the final ACK was received by the peer",
          is_correct: true,
          explanation: "Correct! TIME_WAIT prevents wandering delayed segments from corrupting new connections sharing the same IP/port tuple."
        },
        {
          id: "b",
          text: "To flush CPU L3 cache lines to physical RAM",
          is_correct: false,
          explanation: "TIME_WAIT is purely an OS transport-layer protocol state."
        },
        {
          id: "c",
          text: "To negotiate a lower MTU size for future sessions",
          is_correct: false,
          explanation: "MTU negotiation occurs during PMTU discovery."
        },
        {
          id: "d",
          text: "To allow the peer to continue sending streaming data indefinitely",
          is_correct: false,
          explanation: "TIME_WAIT occurs after both endpoints have closed transmission."
        }
      ]
    },
    {
      id: "q_tcp_int_2",
      skill_id: "tcp_ip_sockets",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 TCP Flow Control & Sliding Window: Flow control prevents the sender from overwhelming the receiver's buffer.",
      hint: "Which TCP header field advertises available receiver buffer space?",
      prompt: "How does TCP Flow Control prevent a fast sender from overrunning a slow receiver's memory buffer?",
      options: [
        {
          id: "a",
          text: "The receiver advertises its available buffer space in the TCP `Window Size` header field, bounding the number of unacknowledged bytes the sender can transmit",
          is_correct: true,
          explanation: "Correct! The sliding window dynamically throttles transmission to match the receiver's processing capacity."
        },
        {
          id: "b",
          text: "The sender periodically drops 50% of its packets automatically",
          is_correct: false,
          explanation: "Dropping packets is congestion collapse, not controlled flow control."
        },
        {
          id: "c",
          text: "By routing packets through a central hardware load balancer",
          is_correct: false,
          explanation: "Flow control is an end-to-end transport layer protocol feature."
        },
        {
          id: "d",
          text: "By converting TCP into UDP datagrams when memory is tight",
          is_correct: false,
          explanation: "TCP connections never convert dynamically to UDP."
        }
      ]
    },
    {
      id: "q_tcp_int_3",
      skill_id: "tcp_ip_sockets",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Nagle's Algorithm & TCP_NODELAY: Nagle buffers small segments until an ACK arrives, which can introduce latency spikes when paired with delayed ACKs.",
      hint: "Why do low-latency services set TCP_NODELAY = 1?",
      prompt: "Why is `TCP_NODELAY` commonly enabled (disabling Nagle's algorithm) in real-time APIs and database client libraries?",
      options: [
        {
          id: "a",
          text: "To immediately transmit small packets without waiting for the remote peer's ACK, eliminating 40-200ms latency spikes",
          is_correct: true,
          explanation: "Correct! Disabling Nagle ensures small packets (like query commands) are sent instantly."
        },
        {
          id: "b",
          text: "To compress packets using Zstandard before transmission",
          is_correct: false,
          explanation: "TCP_NODELAY controls transmission buffering, not compression."
        },
        {
          id: "c",
          text: "To bypass kernel socket buffer size restrictions",
          is_correct: false,
          explanation: "Buffer sizes are controlled by SO_RCVBUF and SO_SNDBUF."
        },
        {
          id: "d",
          text: "To enable TLS encryption on raw TCP connections",
          is_correct: false,
          explanation: "Encryption requires TLS record layer wrapping."
        }
      ]
    },
    {
      id: "q_tcp_int_4",
      skill_id: "tcp_ip_sockets",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 TCP SYN Flood Attacks & SYN Cookies: SYN floods exhaust embryonic connection queues.",
      hint: "How do SYN cookies avoid allocating connection state before the 3-way handshake finishes?",
      prompt: "How does the Linux kernel `tcp_syncookies` feature defend against TCP SYN flood denial-of-service attacks?",
      options: [
        {
          id: "a",
          text: "It encodes connection state into the initial Sequence Number (ISN) in the SYN-ACK, allocating no kernel memory until the client's final ACK arrives",
          is_correct: true,
          explanation: "Correct! SYN cookies compute a cryptographic hash for the ISN, avoiding half-open connection memory exhaustion."
        },
        {
          id: "b",
          text: "It blocks all incoming traffic from the entire subnet",
          is_correct: false,
          explanation: "SYN cookies allow legitimate clients to connect transparently."
        },
        {
          id: "c",
          text: "It shuts down the web server port for 10 minutes",
          is_correct: false,
          explanation: "SYN cookies maintain continuous service availability."
        },
        {
          id: "d",
          text: "It requires clients to solve a proof-of-work CAPTCHA over TCP",
          is_correct: false,
          explanation: "SYN cookies operate silently within standard TCP sequence math."
        }
      ]
    }
  ],

  dns_resolution: [
    {
      id: "q_dns_int_1",
      skill_id: "dns_resolution",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 DNS Hierarchy: Resolution traverses Root -> TLD (.com/.org) -> Authoritative servers.",
      hint: "Which server holds the definitive final record?",
      prompt: "In recursive DNS resolution, which server holds the authoritative zone records for a specific custom domain?",
      options: [
        {
          id: "a",
          text: "The Authoritative Name Server designated for the domain",
          is_correct: true,
          explanation: "Correct! Authoritative name servers hold the source zone records configured by the domain owner."
        },
        {
          id: "b",
          text: "The Root Name Server cluster (a.root-servers.net)",
          is_correct: false,
          explanation: "Root servers only point queries to the corresponding TLD servers."
        },
        {
          id: "c",
          text: "The local router's DHCP pool",
          is_correct: false,
          explanation: "Local DHCP assigns client IP settings, but does not own internet zone files."
        },
        {
          id: "d",
          text: "The web browser's local cookie jar",
          is_correct: false,
          explanation: "Cookies store HTTP session data, not DNS zone records."
        }
      ]
    },
    {
      id: "q_dns_int_2",
      skill_id: "dns_resolution",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 CNAME vs A Records: CNAME aliases a domain to another domain, whereas A maps to an IPv4 address.",
      hint: "Why can't a CNAME record typically coexist with other records at the apex/root domain (example.com)?",
      prompt: "Why does the DNS specification (RFC 1034) prohibit creating a CNAME record at the zone apex (`example.com`)?",
      options: [
        {
          id: "a",
          text: "Because a CNAME takes precedence over all other record types, which would hide mandatory apex SOA and NS records",
          is_correct: true,
          explanation: "Correct! CNAME aliases the entire node, conflicting with required apex SOA and NS records."
        },
        {
          id: "b",
          text: "Because apex domains only support IPv6 AAAA records",
          is_correct: false,
          explanation: "Apex domains support standard A and AAAA records."
        },
        {
          id: "c",
          text: "Because CNAME records cannot exceed 8 characters in length",
          is_correct: false,
          explanation: "CNAME values follow standard FQDN length limits."
        },
        {
          id: "d",
          text: "Because CNAME records are deprecated in modern DNS",
          is_correct: false,
          explanation: "CNAME is widely used for subdomains."
        }
      ]
    },
    {
      id: "q_dns_int_3",
      skill_id: "dns_resolution",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 DNS TTL & Caching: TTL dictates how long resolvers can cache responses before querying again.",
      hint: "Why reduce TTL before major migrations?",
      prompt: "Why do platform teams lower DNS record TTLs to 60-300 seconds 24 hours prior to a planned cloud datacenter migration?",
      options: [
        {
          id: "a",
          text: "To ensure caching resolvers flush expired records quickly so traffic pivots to the new IP address within minutes of the cutover",
          is_correct: true,
          explanation: "Correct! Lowering TTL prevents stale IP caching across worldwide recursive resolvers."
        },
        {
          id: "b",
          text: "To increase the TLS encryption key size",
          is_correct: false,
          explanation: "TTL does not affect TLS cryptographic keys."
        },
        {
          id: "c",
          text: "To compress HTTP responses in transit",
          is_correct: false,
          explanation: "DNS operates at the name resolution layer, not HTTP compression."
        },
        {
          id: "d",
          text: "To clear user browser search history",
          is_correct: false,
          explanation: "DNS TTLs govern resolver cache duration only."
        }
      ]
    },
    {
      id: "q_dns_int_4",
      skill_id: "dns_resolution",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Split-Horizon DNS & Internal Resolvers: Serves private IP addresses to internal VPC clients and public IPs to external internet users.",
      hint: "What is this architectural pattern called?",
      prompt: "What architectural pattern enables `db.internal.company.com` to resolve to a private VPC IP `10.0.4.15` inside the cloud while remaining unresolvable from the public internet?",
      options: [
        {
          id: "a",
          text: "Split-Horizon / Private Hosted Zone DNS",
          is_correct: true,
          explanation: "Correct! Private hosted zones bind to internal VPC networks, shielding internal network topologies from public resolution."
        },
        {
          id: "b",
          text: "Dynamic DNS (DDNS) with NAT traversal",
          is_correct: false,
          explanation: "DDNS updates public IPs for residential connections."
        },
        {
          id: "c",
          text: "Round-Robin DNS load balancing",
          is_correct: false,
          explanation: "Round-robin rotates multiple IP answers for traffic distribution."
        },
        {
          id: "d",
          text: "DNSSEC Zone Signing",
          is_correct: false,
          explanation: "DNSSEC provides cryptographic authenticity, not private network isolation."
        }
      ]
    }
  ],

  // =========================================================================
  // DOMAIN 2: Python Fundamentals
  // =========================================================================
  python_syntax_variables: [
    {
      id: "q_py_var_int_1",
      skill_id: "python_syntax_variables",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Python Variable Reference Model: Variables in Python are references (pointers) to objects in memory, not memory boxes containing raw values.",
      hint: "What happens when `a = [1, 2]` and `b = a`?",
      prompt: "Given `a = [1, 2, 3]` and `b = a`, what happens when executing `b.append(4)`?",
      options: [
        {
          id: "a",
          text: "Both `a` and `b` evaluate to `[1, 2, 3, 4]` because both variables reference the exact same mutable list object in memory",
          is_correct: true,
          explanation: "Correct! Assignment binds the identifier `b` to the same memory object referenced by `a`."
        },
        {
          id: "b",
          text: "`b` becomes `[1, 2, 3, 4]` while `a` remains `[1, 2, 3]`",
          is_correct: false,
          explanation: "Assignment in Python does not create a shallow or deep copy."
        },
        {
          id: "c",
          text: "Python raises a TypeError because `a` is immutable",
          is_correct: false,
          explanation: "Lists are mutable sequences in Python."
        },
        {
          id: "d",
          text: "`a` becomes `None`",
          is_correct: false,
          explanation: "Appending to `b` does not alter `a`'s reference binding."
        }
      ]
    },
    {
      id: "q_py_var_int_2",
      skill_id: "python_syntax_variables",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 `is` vs `==`: `==` checks value equality; `is` checks memory identity (`id(a) == id(b)`).",
      hint: "When are two lists identical in memory vs having equal values?",
      prompt: "What is the difference between `list1 == list2` and `list1 is list2` in Python?",
      options: [
        {
          id: "a",
          text: "`==` evaluates whether the contents/values are equal, whereas `is` checks whether both references point to the exact same object in memory",
          is_correct: true,
          explanation: "Correct! `==` invokes `__eq__`, while `is` compares memory pointers (`id()`)."
        },
        {
          id: "b",
          text: "`is` performs type-casting before equality comparison",
          is_correct: false,
          explanation: "`is` does not cast types; it tests identity."
        },
        {
          id: "c",
          text: "`==` is only for numbers; `is` is only for strings",
          is_correct: false,
          explanation: "Both operators work across all Python objects."
        },
        {
          id: "d",
          text: "They are completely identical aliases in Python 3",
          is_correct: false,
          explanation: "`==` and `is` have fundamentally distinct semantics."
        }
      ]
    },
    {
      id: "q_py_var_int_3",
      skill_id: "python_syntax_variables",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Shallow vs Deep Copy: A shallow copy copies the top-level container, while nested mutable objects remain shared.",
      hint: "How does `copy.deepcopy()` handle nested lists?",
      prompt: "When working with nested structures like `matrix = [[1, 2], [3, 4]]`, why must `copy.deepcopy()` be used instead of `matrix.copy()`?",
      options: [
        {
          id: "a",
          text: "`matrix.copy()` creates a shallow copy whose inner sublists still point to the original inner list objects in memory",
          is_correct: true,
          explanation: "Correct! A shallow copy duplicates only the outer list; mutations to inner sublists affect both copies."
        },
        {
          id: "b",
          text: "`matrix.copy()` converts all integers to strings",
          is_correct: false,
          explanation: "Shallow copying preserves element data types."
        },
        {
          id: "c",
          text: "`matrix.copy()` throws a MemoryError on lists with more than 1 element",
          is_correct: false,
          explanation: "`.copy()` works on lists of any valid length."
        },
        {
          id: "d",
          text: "Deep copy is only required for tuples",
          is_correct: false,
          explanation: "Tuples are immutable; deep copies are essential for nested mutable containers."
        }
      ]
    },
    {
      id: "q_py_var_int_4",
      skill_id: "python_syntax_variables",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Immutability & Hashability: Immutable types (int, float, str, tuple with immutable elements) can be dict keys or set elements.",
      hint: "Why can't a list be a dictionary key?",
      prompt: "Why does Python raise `TypeError: unhashable type: 'list'` when attempting to use a list as a dictionary key?",
      options: [
        {
          id: "a",
          text: "Because lists are mutable; their contents can change after insertion, which would break the hash table's internal lookup invariance",
          is_correct: true,
          explanation: "Correct! Dict keys must implement `__hash__` and maintain an immutable hash value throughout their lifecycle."
        },
        {
          id: "b",
          text: "Because lists occupy too much RAM to fit in dictionary buckets",
          is_correct: false,
          explanation: "Hash tables store pointer references, not raw element copies."
        },
        {
          id: "c",
          text: "Because dictionary keys can only be single-character strings",
          is_correct: false,
          explanation: "Any hashable object (tuples, frozensets, custom classes) can serve as dict keys."
        },
        {
          id: "d",
          text: "Because lists are evaluated asynchronously by the interpreter",
          is_correct: false,
          explanation: "Python dictionary lookups are purely synchronous."
        }
      ]
    }
  ],

  control_flow: [
    {
      id: "q_py_ctrl_int_1",
      skill_id: "control_flow",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Short-Circuit Boolean Evaluation: `and` and `or` return the actual operand object that determined the truth value.",
      hint: "What does `[] or 'default'` evaluate to?",
      prompt: "What is the exact result of the Python expression `x = [] or 'fallback'`?",
      options: [
        {
          id: "a",
          text: "'fallback' — because `[]` is falsy, so `or` evaluates and returns the right-hand operand",
          is_correct: true,
          explanation: "Correct! Python's `or` operator short-circuits and returns the first truthy value (or the last operand if all are falsy)."
        },
        {
          id: "b",
          text: "True (boolean)",
          is_correct: false,
          explanation: "Python returns the determining operand itself, not a coerced boolean."
        },
        {
          id: "c",
          text: "[] (empty list)",
          is_correct: false,
          explanation: "`[]` is falsy, so evaluation proceeds past it."
        },
        {
          id: "d",
          text: "TypeError: unsupported operand types",
          is_correct: false,
          explanation: "Boolean expressions operate across all Python object types."
        }
      ]
    },
    {
      id: "q_py_ctrl_int_2",
      skill_id: "control_flow",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Chained Comparisons: `1 < x < 10` is evaluated as `(1 < x) and (x < 10)` where `x` is evaluated only once.",
      hint: "How does Python handle chained relational operators?",
      prompt: "How does Python evaluate the chained comparison `0 < x <= 100`?",
      options: [
        {
          id: "a",
          text: "As `(0 < x) and (x <= 100)`, with `x` evaluated only once",
          is_correct: true,
          explanation: "Correct! Chained comparisons evaluate intermediate expressions once, cleanly testing ranges."
        },
        {
          id: "b",
          text: "As `((0 < x) <= 100)`, comparing the boolean result to 100",
          is_correct: false,
          explanation: "That is how C/JavaScript evaluate expressions, but Python natively chains them with logical `and`."
        },
        {
          id: "c",
          text: "By converting `x` into a floating point percentage",
          is_correct: false,
          explanation: "Relational chaining preserves original operand types."
        },
        {
          id: "d",
          text: "It causes a SyntaxError in Python 3",
          is_correct: false,
          explanation: "Chained comparisons are idiomatic Python syntax."
        }
      ]
    },
    {
      id: "q_py_ctrl_int_3",
      skill_id: "control_flow",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Truth Value Testing (Falsy Objects): In Python, `0`, `0.0`, `''`, `[]`, `()`, `{}` , `set()`, `None`, and `False` are falsy.",
      hint: "Which custom class method determines truthiness when `if obj:` runs?",
      prompt: "When Python evaluates `if custom_object:`, which dunder method does it inspect first to determine truthiness?",
      options: [
        {
          id: "a",
          text: "`__bool__()`, falling back to `__len__() != 0` if `__bool__` is not defined",
          is_correct: true,
          explanation: "Correct! Python checks `__bool__()` first; if absent, it checks whether `__len__()` returns non-zero."
        },
        {
          id: "b",
          text: "`__repr__()` only",
          is_correct: false,
          explanation: "`__repr__` produces debugging string representations."
        },
        {
          id: "c",
          text: "`__eq__()` against `True`",
          is_correct: false,
          explanation: "Truthiness does not perform equality comparison against boolean True."
        },
        {
          id: "d",
          text: "`__call__()`",
          is_correct: false,
          explanation: "`__call__` allows instances to be called as functions."
        }
      ]
    },
    {
      id: "q_py_ctrl_int_4",
      skill_id: "control_flow",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Guard Clauses & Early Returns: Refactoring nested conditionals into flat early returns reduces cognitive complexity.",
      hint: "What is the primary benefit of the Bouncer / Guard Clause pattern?",
      prompt: "Why do senior Python engineers prefer 'Guard Clauses' (`if not valid: return`) over deep nested `if/else` blocks?",
      options: [
        {
          id: "a",
          text: "It minimizes indentation levels, handles failure preconditions upfront, and keeps the happy path aligned to the left margin",
          is_correct: true,
          explanation: "Correct! Guard clauses flatten nesting and make code significantly easier to read, test, and maintain."
        },
        {
          id: "b",
          text: "It disables the Global Interpreter Lock (GIL) for that function",
          is_correct: false,
          explanation: "Code structure does not alter GIL behavior."
        },
        {
          id: "c",
          text: "Because Python limits function indentation to a maximum of 3 levels",
          is_correct: false,
          explanation: "Python has no hardcoded 3-level indentation limit."
        },
        {
          id: "d",
          text: "It forces the compiler to inline the function into assembly",
          is_correct: false,
          explanation: "CPython bytecode is interpreted, not inlined as assembly."
        }
      ]
    }
  ],

  loops_iteration: [
    {
      id: "q_py_loop_int_1",
      skill_id: "loops_iteration",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Loop `else` Clause: The `else` block of a `for` or `while` loop executes only if the loop completed without encountering a `break`.",
      hint: "When does loop `else` run?",
      prompt: "In Python, under what condition does the `else:` block attached to a `for` loop execute?",
      options: [
        {
          id: "a",
          text: "When the loop completes all iterations naturally without hitting a `break` statement",
          is_correct: true,
          explanation: "Correct! The `else` block acts as a 'no-break-occurred' confirmation, useful for search loops."
        },
        {
          id: "b",
          text: "Whenever the loop encounters an unhandled exception",
          is_correct: false,
          explanation: "Exceptions are caught by `try/except` blocks."
        },
        {
          id: "c",
          text: "On every single iteration of the loop",
          is_correct: false,
          explanation: "It executes at most once after loop completion."
        },
        {
          id: "d",
          text: "Only if the iterable collection was completely empty",
          is_correct: false,
          explanation: "An empty iterable still runs `else` because no `break` occurred."
        }
      ]
    },
    {
      id: "q_py_loop_int_2",
      skill_id: "loops_iteration",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Iterating with `enumerate()` and `zip()`: `zip(strict=True)` in Python 3.10+ ensures paired iterables have identical length.",
      hint: "What happens when `zip(a, b, strict=True)` encounters mismatched lengths?",
      prompt: "What does `zip(list1, list2, strict=True)` do if `list1` has 3 elements and `list2` has 5 elements?",
      options: [
        {
          id: "a",
          text: "Raises a `ValueError` when the shorter iterable is exhausted",
          is_correct: true,
          explanation: "Correct! `strict=True` prevents silent data truncation when paired sequences are expected to match in length."
        },
        {
          id: "b",
          text: "Fills missing values with `None` automatically",
          is_correct: false,
          explanation: "Filling with `None` is the behavior of `itertools.zip_longest()`, not `strict=True`."
        },
        {
          id: "c",
          text: "Silently truncates to the first 3 pairs without error",
          is_correct: false,
          explanation: "Standard `zip()` without `strict=True` silently truncates."
        },
        {
          id: "d",
          text: "Loops infinitely",
          is_correct: false,
          explanation: "`zip` terminates upon exhausting iterables."
        }
      ]
    },
    {
      id: "q_py_loop_int_3",
      skill_id: "loops_iteration",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Safe Collection Mutation: Modifying a list or dictionary while iterating over it causes skipped items or RuntimeError.",
      hint: "How should you safely filter items while looping?",
      prompt: "Why is `for item in my_list: if condition(item): my_list.remove(item)` dangerous, and what is the idiomatic fix?",
      options: [
        {
          id: "a",
          text: "Mutating the list alters internal index pointers and skips subsequent elements; fix with list comprehension `[x for x in my_list if not condition(x)]` or iterating over a slice copy `my_list[:]`",
          is_correct: true,
          explanation: "Correct! Removing items shifts subsequent indices leftward, causing the iterator to skip neighboring items."
        },
        {
          id: "b",
          text: "It causes an immediate memory segmentation fault in CPython",
          is_correct: false,
          explanation: "It produces logical index skipping, not segmentation faults."
        },
        {
          id: "c",
          text: "Because `.remove()` is only valid on tuples",
          is_correct: false,
          explanation: "Tuples do not have a `.remove()` method."
        },
        {
          id: "d",
          text: "Because Python lists can only hold up to 10 items",
          is_correct: false,
          explanation: "Lists have dynamically bounded length."
        }
      ]
    },
    {
      id: "q_py_loop_int_4",
      skill_id: "loops_iteration",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Generator Expressions vs List Comprehensions: `(x for x in data)` evaluates lazily and consumes $O(1)$ memory.",
      hint: "Why use generator expressions for large data streams?",
      prompt: "When processing a 5-gigabyte text file line by line, why should you use a generator expression `(parse(line) for line in file)` instead of a list comprehension `[parse(line) for line in file]`?",
      options: [
        {
          id: "a",
          text: "The generator expression evaluates lazily one item at a time in $O(1)$ memory, whereas a list comprehension allocates all 5GB of parsed elements in RAM simultaneously",
          is_correct: true,
          explanation: "Correct! Generators stream elements on-demand, preventing Out-Of-Memory (OOM) crashes on large datasets."
        },
        {
          id: "b",
          text: "Generators automatically compile Python to C++",
          is_correct: false,
          explanation: "Generators use standard Python frame evaluation."
        },
        {
          id: "c",
          text: "List comprehensions cannot call custom functions",
          is_correct: false,
          explanation: "List comprehensions can invoke any callable."
        },
        {
          id: "d",
          text: "Generators delete the file after reading",
          is_correct: false,
          explanation: "File deletion is never performed by generators."
        }
      ]
    }
  ],

  // =========================================================================
  // DOMAIN 3: Web Basics (HTML/CSS/JS)
  // =========================================================================
  html_semantic_markup: [
    {
      id: "q_html_int_1",
      skill_id: "html_semantic_markup",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Semantic Landmarks: `<main>`, `<nav>`, `<aside>`, `<header>`, and `<footer>` create navigational landmarks for assistive technologies.",
      hint: "How many `<main>` landmarks should be visible per page?",
      prompt: "According to HTML5 and W3C Accessibility guidelines, what is the rule regarding the `<main>` element on a web page?",
      options: [
        {
          id: "a",
          text: "There must be only one visible `<main>` element per document representing the central primary content",
          is_correct: true,
          explanation: "Correct! The `<main>` element represents the dominant topic of the page; duplicate visible `<main>` landmarks violate accessibility standards."
        },
        {
          id: "b",
          text: "Every `<section>` must contain its own `<main>` tag",
          is_correct: false,
          explanation: "Nesting `<main>` inside `<section>` is invalid HTML5."
        },
        {
          id: "c",
          text: "`<main>` is deprecated in favor of `<div id='main'>`",
          is_correct: false,
          explanation: "`<main>` is the standard semantic landmark."
        },
        {
          id: "d",
          text: "`<main>` can only contain plain text with no child HTML tags",
          is_correct: false,
          explanation: "`<main>` accepts any valid flow content."
        }
      ]
    },
    {
      id: "q_html_int_2",
      skill_id: "html_semantic_markup",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 `<section>` vs `<article>`: An `<article>` is self-contained and independently distributable (e.g. blog post, card); a `<section>` is a thematic grouping.",
      hint: "Which tag is best suited for a syndicate-ready blog card?",
      prompt: "When structuring an individual product card in an e-commerce feed that could be syndicated or shared independently, which element is semantically correct?",
      options: [
        {
          id: "a",
          text: "`<article>`",
          is_correct: true,
          explanation: "Correct! `<article>` is intended for self-contained compositions reusable in syndication or feeds."
        },
        {
          id: "b",
          text: "`<aside>`",
          is_correct: false,
          explanation: "`<aside>` is for tangentially related sidebars."
        },
        {
          id: "c",
          text: "`<address>`",
          is_correct: false,
          explanation: "`<address>` provides contact info for the author."
        },
        {
          id: "d",
          text: "`<nav>`",
          is_correct: false,
          explanation: "`<nav>` contains navigation links."
        }
      ]
    },
    {
      id: "q_html_int_3",
      skill_id: "html_semantic_markup",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Accessible Form Labels: `<label for='id'>` or wrapping the `<input>` programmatically binds labels for screen readers.",
      hint: "Why is `placeholder=` not an acceptable substitute for a `<label>`?",
      prompt: "Why does the W3C Web Accessibility Initiative (WAI) advise against using `<input placeholder='...'>` as the sole label for form fields?",
      options: [
        {
          id: "a",
          text: "Placeholders disappear once users start typing, lack persistent contrast, and are not consistently announced as accessible field names by all screen readers",
          is_correct: true,
          explanation: "Correct! Placeholders disappear on input and fail WCAG contrast guidelines; proper `<label>` elements are required."
        },
        {
          id: "b",
          text: "Because placeholders increase form submission payload size",
          is_correct: false,
          explanation: "Placeholders are not submitted in HTTP request bodies."
        },
        {
          id: "c",
          text: "Because browsers block form submission if placeholders are present",
          is_correct: false,
          explanation: "Placeholders have no impact on native form submission logic."
        },
        {
          id: "d",
          text: "Because placeholders only support numbers",
          is_correct: false,
          explanation: "Placeholders support arbitrary text."
        }
      ]
    },
    {
      id: "q_html_int_4",
      skill_id: "html_semantic_markup",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Image Optimization with `<picture>`: Provides responsive multi-resolution and modern image format (AVIF/WebP) fallback sources.",
      hint: "How does `<picture>` provide format fallbacks?",
      prompt: "How does the HTML `<picture>` element optimize responsive web performance compared to a plain `<img>` tag?",
      options: [
        {
          id: "a",
          text: "It lets developers declare multiple `<source>` tags with `srcset`, `media`, and `type` (AVIF/WebP), allowing the browser to download only the most modern format supported at the user's viewport",
          is_correct: true,
          explanation: "Correct! `<picture>` provides content negotiation for next-gen image formats and art direction."
        },
        {
          id: "b",
          text: "It compiles PNG images into SVG vectors in browser memory",
          is_correct: false,
          explanation: "`<picture>` does not convert raster files into vectors."
        },
        {
          id: "c",
          text: "It disables browser caching for graphics",
          is_correct: false,
          explanation: "Caching is governed by HTTP headers, not `<picture>`."
        },
        {
          id: "d",
          text: "It uploads images to a CDN automatically",
          is_correct: false,
          explanation: "HTML elements do not manage server-side CDN uploads."
        }
      ]
    }
  ],

  // =========================================================================
  // DOMAIN 4: Data Analysis with NumPy & Pandas
  // =========================================================================
  numpy_ndarray_basics: [
    {
      id: "q_np_arr_int_1",
      skill_id: "numpy_ndarray_basics",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Array Views vs Copies: Slicing an ndarray returns a view sharing memory; boolean and integer array indexing creates a copy.",
      hint: "What happens when you modify `slice_view = arr[1:3]`?",
      prompt: "Given a NumPy array `arr = np.array([10, 20, 30, 40])`, what happens when you execute `sub = arr[1:3]; sub[0] = 99`?",
      options: [
        {
          id: "a",
          text: "`arr` is modified to `[10, 99, 30, 40]` because basic slicing in NumPy returns a view sharing the original memory buffer",
          is_correct: true,
          explanation: "Correct! Basic slicing returns a view without copying memory. Modifying the view mutates the original array."
        },
        {
          id: "b",
          text: "`arr` remains `[10, 20, 30, 40]` because slices are always independent copies",
          is_correct: false,
          explanation: "Python list slices copy memory, but NumPy array slices return views."
        },
        {
          id: "c",
          text: "NumPy raises a ReadOnlyError",
          is_correct: false,
          explanation: "Standard NumPy slices are writable views."
        },
        {
          id: "d",
          text: "`sub` becomes a 2D matrix",
          is_correct: false,
          explanation: "Slicing preserves 1D dimensionality."
        }
      ]
    },
    {
      id: "q_np_arr_int_2",
      skill_id: "numpy_ndarray_basics",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 Reshaping & `-1` Dimension: Passing `-1` instructs NumPy to infer the dimension automatically from the total number of elements.",
      hint: "If an array has 12 elements and you reshape to `(3, -1)`, what is the second dimension?",
      prompt: "If an array `a` has 12 elements, what shape does `a.reshape(3, -1)` produce?",
      options: [
        {
          id: "a",
          text: "`(3, 4)` — NumPy automatically calculates $12 / 3 = 4$ for the `-1` placeholder",
          is_correct: true,
          explanation: "Correct! `-1` tells NumPy to deduce that dimension from array size."
        },
        {
          id: "b",
          text: "`(3, 12)`",
          is_correct: false,
          explanation: "Total elements must remain constant ($3 \\times 4 = 12$)."
        },
        {
          id: "c",
          text: "`(1, 3)`",
          is_correct: false,
          explanation: "The first dimension was specified as 3."
        },
        {
          id: "d",
          text: "ValueError: negative dimensions are invalid",
          is_correct: false,
          explanation: "`-1` is the special dimension inference indicator in `.reshape()`."
        }
      ]
    },
    {
      id: "q_np_arr_int_3",
      skill_id: "numpy_ndarray_basics",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 NumPy Dtypes & Downcasting: Selecting `np.int16` or `np.float32` instead of default `int64`/`float64` cuts RAM consumption by 50-75%.",
      hint: "How much memory does an array of 10 million float32 numbers consume compared to float64?",
      prompt: "How much memory does an array of 10,000,000 values consume when stored as `float32` versus default `float64`?",
      options: [
        {
          id: "a",
          text: "40 Megabytes for `float32` (4 bytes/elem) vs 80 Megabytes for `float64` (8 bytes/elem) — exactly 50% memory savings",
          is_correct: true,
          explanation: "Correct! `float32` uses 4 bytes per float, halving memory bandwidth and RAM usage."
        },
        {
          id: "b",
          text: "Both consume the exact same amount of memory in Python",
          is_correct: false,
          explanation: "NumPy arrays are compact C-level buffers whose size directly depends on the dtype."
        },
        {
          id: "c",
          text: "`float32` consumes 10 Megabytes total",
          is_correct: false,
          explanation: "$10{,}000{,}000 \\times 4\\text{ bytes} = 40{,}000{,}000\\text{ bytes} \\approx 40\\text{ MB}$."
        },
        {
          id: "d",
          text: "`float32` is not supported in modern NumPy",
          is_correct: false,
          explanation: "`float32` is fundamental to scientific computing and machine learning."
        }
      ]
    },
    {
      id: "q_np_arr_int_4",
      skill_id: "numpy_ndarray_basics",
      stage: 3,
      difficulty: "intermediate",
      tier: "standard",
      concept_primer: "💡 C-Contiguous vs Fortran-Contiguous: C-order stores rows contiguously; Fortran-order stores columns contiguously.",
      hint: "Why does iterating along rows in C-contiguous arrays run faster?",
      prompt: "Why is summing rows of a standard C-contiguous 2D NumPy array significantly faster than summing along columns?",
      options: [
        {
          id: "a",
          text: "Because row elements are stored adjacently in linear memory, maximizing CPU cache line hits during sequential traversal",
          is_correct: true,
          explanation: "Correct! Spatial locality ensures contiguous row bytes are loaded into L1/L2 CPU caches together."
        },
        {
          id: "b",
          text: "Because columns are encrypted in memory",
          is_correct: false,
          explanation: "NumPy memory buffers are unencrypted."
        },
        {
          id: "c",
          text: "Because Python disables multithreading on column operations",
          is_correct: false,
          explanation: "Performance difference is due to memory locality, not thread locks."
        },
        {
          id: "d",
          text: "Because row operations skip floating point rounding",
          is_correct: false,
          explanation: "Mathematical precision is identical."
        }
      ]
    }
  ]
};

// Aliases for cross-domain key compatibility
INTERMEDIATE_QUESTIONS_MAP['py_variables_datatypes'] = INTERMEDIATE_QUESTIONS_MAP['python_syntax_variables'];
INTERMEDIATE_QUESTIONS_MAP['py_control_flow'] = INTERMEDIATE_QUESTIONS_MAP['control_flow'];
INTERMEDIATE_QUESTIONS_MAP['py_functions_scope'] = INTERMEDIATE_QUESTIONS_MAP['loops_iteration'];
INTERMEDIATE_QUESTIONS_MAP['html_semantic_structure'] = INTERMEDIATE_QUESTIONS_MAP['html_semantic_markup'];
INTERMEDIATE_QUESTIONS_MAP['py_numpy_arrays'] = INTERMEDIATE_QUESTIONS_MAP['numpy_ndarray_basics'];
