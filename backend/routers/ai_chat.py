"""
AI Chat Route Controller (/ai/chat POST)
Provides concise, pedagogical AI responses for any user query using Google Gemini AI,
grounded with current learner context (active skill, domain, mastery level).
"""
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from backend.config import settings

logger = logging.getLogger("skilltwin.ai_chat")
router = APIRouter(prefix="/ai", tags=["AI Chatbot"])


class AIChatRequest(BaseModel):
    query: str
    skill_id: Optional[str] = None
    domain: Optional[str] = None
    mastery_prob: Optional[float] = None


class AIChatResponse(BaseModel):
    reply: str
    grounding: Optional[Dict[str, Any]] = None
    source: str = "gemini_ai"


CHATBOT_SYSTEM_PROMPT = """
You are SkillTwin's AI Learning Assistant — an intelligent, versatile, and supportive AI tutor for learners studying software engineering, computer science, and data analysis.

CORE BEHAVIOR & GUIDELINES:
1. Handle ANY natural language query naturally, intelligently, and contextually:
   - Course & Roadmap Questions (e.g., "What will I learn in this course?", "How does this track work?", "What should I study next?"): Answer directly based on the domain curriculum and active progress.
   - Technical Explanations & Concepts (e.g., "Explain TCP vs UDP", "How does indexing work?"): Give a clear, pedagogically sound answer focusing on core principles.
   - Study Advice & Interview Prep: Provide actionable, practical advice.
   - Conversational Queries & Greetings: Respond warmly and concisely as an AI tutor.
2. Keep responses clear, helpful, and concise (typically 2 to 4 concise sentences or a clean bulleted breakdown if asked for a list).
3. Use clean markdown with **bold** keywords and `code` tags where helpful.
4. Avoid rigid or robotic formulas; communicate naturally and directly without fluff.
"""


def generate_concise_fallback_answer(query: str, skill_id: Optional[str] = None, domain: Optional[str] = None) -> str:
    """Generate intelligent natural-language answer when Gemini API is offline or unauthenticated."""
    q = query.lower().strip()
    dom_label = (domain or "backend_engineering").replace("_", " ").title()
    active_topic = (skill_id or "").replace("_", " ").title()

    # 1. TLS / SSL / Certificate Validation
    if any(k in q for k in ["tls", "ssl", "certificate", "https", "handshake"]):
        return (
            "**TLS Certificate Validation** is the security process where a client cryptographically verifies a server's identity before establishing an encrypted tunnel. "
            "The client inspects the server's X.509 certificate chain against trusted Root Certificate Authorities (CAs), checks expiration dates, verifies the hostname matches (Subject Alternative Names), "
            "and inspects revocation status (OCSP/CRL) to prevent Man-in-the-Middle (MitM) attacks."
        )

    # 2. Networking (TCP, UDP, HTTP, DNS)
    if any(k in q for k in ["tcp", "udp", "http", "dns", "socket", "three-way handshake"]):
        if "tcp" in q and "udp" in q:
            return (
                "**TCP vs. UDP**: TCP is a connection-oriented, reliable protocol providing ordered byte-stream delivery with congestion control and retransmissions (ideal for HTTP, databases, and APIs). "
                "UDP is connectionless and lightweight with no delivery guarantees or head-of-line blocking, making it ideal for real-time video streaming, DNS lookups, and gaming."
            )
        return (
            f"**Networking Primitives in {dom_label}**: Layer 4 (TCP/UDP) handles packet sequencing and multiplexing over IP ports, while Layer 7 (HTTP/1.1, HTTP/2, HTTP/3) defines application communication protocols. "
            "In modern cloud systems, optimizing socket lifecycles, connection pooling, and keep-alive headers prevents connection starvation under high throughput."
        )

    # 3. Databases & Indexing
    if any(k in q for k in ["index", "b-tree", "sql", "postgres", "foreign key", "acid", "nosql"]):
        return (
            "**Database Indexing & Modeling**: Indexes (primarily B-Trees and Hash indexes) map column keys to physical disk pointers, transforming $O(N)$ full table scans into $O(\\log N)$ lookups. "
            "Relational design enforces ACID transactional guarantees and referential integrity, while query planners use statistics to select optimal join algorithms (Nested Loop, Hash Join, Merge Join)."
        )

    # 4. Caching & Redis
    if any(k in q for k in ["redis", "cache", "memcached", "ttl", "cache-aside"]):
        return (
            "**Caching with Redis**: Redis acts as an in-memory key-value data store providing sub-millisecond read/write latency. "
            "Using patterns like **Cache-Aside**, services query Redis first and fallback to relational databases only on cache misses, setting explicit Time-to-Live (TTL) policies and LRU eviction to maintain fresh state."
        )

    # 5. Concurrency & Async
    if any(k in q for k in ["async", "await", "thread", "process", "event loop", "concurrency", "goroutine"]):
        return (
            "**Concurrency & Async I/O**: Asynchronous architectures utilize non-blocking system calls (such as `epoll` or `kqueue`) coordinated by a single-threaded Event Loop. "
            "Unlike multi-threaded models where threads incur operating system context-switching overhead and memory locks, async I/O can handle tens of thousands of concurrent client connections efficiently."
        )

    # 6. Docker & Containers
    if any(k in q for k in ["docker", "container", "kubernetes", "k8s", "cgroups"]):
        return (
            "**Containerization**: Docker leverages Linux kernel features—namely **Namespaces** (for process and network isolation) and **cgroups** (for CPU/RAM resource limits)—to package code with all dependencies into lightweight, immutable images that execute consistently across all environments."
        )

    # 7. Authentication & Security (JWT, OAuth)
    if any(k in q for k in ["jwt", "oauth", "auth", "token", "cors", "csrf", "bcrypt"]):
        return (
            "**Modern Authentication**: JSON Web Tokens (JWT) enable stateless user authorization using cryptographic signatures (HMAC-SHA256 or RSA). "
            "Passwords must always be salted and hashed using adaptive algorithms like **bcrypt** or Argon2, while sensitive routes enforce OAuth scopes and strict CORS/CSRF headers."
        )

    # 8. Course overview / syllabus questions
    if any(k in q for k in ["what will i learn", "course", "syllabus", "curriculum", "what do i learn", "topics covered", "about this"]):
        domain_topics = {
            "backend_engineering": "networking fundamentals (HTTP/3, TCP/IP, DNS), relational data modeling, database indexing, Redis caching, async event loops, and containerization with Docker",
            "python_fundamentals": "core syntax, control flow, functions, OOP design patterns, decorators, generators, and exception handling",
            "web_basics": "modern semantic HTML, responsive CSS layouts (Flexbox/Grid), JavaScript ES6+ state management, and DOM manipulation",
            "data_analysis_pandas_numpy": "NumPy multidimensional arrays, Pandas DataFrames, data cleaning, aggregation, exploratory analysis, and visualization"
        }
        topics_str = domain_topics.get(domain or "backend_engineering", "core concepts from foundations to advanced production workflows")
        return (
            f"In the **{dom_label}** track, you will learn **{topics_str}**. "
            f"SkillTwin sequences these topics into an adaptive DAG roadmap with real-time knowledge tracing and hands-on practice quizzes."
        )

    # 9. Greetings / Identity
    if any(q.startswith(k) for k in ["hi", "hello", "hey", "who are you", "what can you do", "help me"]):
        return (
            f"Hello! I am your **SkillTwin AI Learning Assistant**. "
            f"You can ask me to explain any technical concept, summarize course roadmaps, help you prepare for practice quizzes, or give study guidance. "
            f"What would you like to explore today?"
        )

    # 10. Next steps / roadmap progression
    if any(k in q for k in ["what next", "what should i study", "where to start", "next step", "what to do"]):
        topic_mention = f" on **{active_topic}**" if active_topic else ""
        return (
            f"Based on your active study roadmap in **{dom_label}**, your current focus is{topic_mention}. "
            f"Take a 3-minute practice quiz to verify your competency and unlock subsequent chapters in your curriculum."
        )

    # 11. Why did plan change
    if "why" in q and any(k in q for k in ["change", "update", "repair", "adapt", "extra"]):
        return (
            f"SkillTwin continuously evaluates your quiz evidence using Bayesian Knowledge Tracing (BKT). "
            f"If an assessment detects a foundational gap, the engine schedules a targeted remedial practice step before harder modules, "
            f"keeping all your previously mastered chapters 100% preserved."
        )

    # 12. General question synthesis
    return (
        f"**{query.strip().rstrip('?')}** is an important concept in {dom_label}. "
        f"In software systems, understanding the underlying trade-offs, standard best practices, and deterministic state handling "
        f"is key to building robust applications."
    )



@router.post(
    "/chat",
    response_model=AIChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Query AI Learning Assistant (Google Gemini Powered)"
)
async def ai_chat(payload: AIChatRequest):
    query = payload.query.strip()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty"
        )

    # 1. Attempt Gemini LLM invocation if API key is present
    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            context_snippet = ""
            if payload.skill_id:
                context_snippet += f"\nLearner Context: Currently studying '{payload.skill_id.replace('_', ' ')}' in domain '{payload.domain or 'backend_engineering'}'."
            if payload.mastery_prob is not None:
                context_snippet += f" Mastery level: {round(payload.mastery_prob * 100)}%."

            user_content = f"Question: {query}{context_snippet}\n\nAnswer very concisely:"

            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=user_content,
                config={
                    "system_instruction": CHATBOT_SYSTEM_PROMPT,
                }
            )

            if response and response.text:
                return AIChatResponse(
                    reply=response.text.strip(),
                    grounding={
                        "topic": payload.skill_id or "General Concept",
                        "model": settings.GEMINI_MODEL,
                        "source": "gemini_ai"
                    },
                    source="gemini_ai"
                )
        except Exception as e:
            logger.warning(
                f"Gemini AI invocation notice: {e}. "
                f"Ensure a valid Google AI Studio API key (AIzaSy...) is configured in .env under GEMINI_API_KEY."
            )

    # 2. Dynamic Fallback Knowledge Synthesis
    fallback_reply = generate_concise_fallback_answer(query, payload.skill_id, payload.domain)
    return AIChatResponse(
        reply=fallback_reply,
        grounding={
            "topic": payload.skill_id or "Knowledge Engine",
            "source": "skilltwin_engine"
        },
        source="skilltwin_engine"
    )
