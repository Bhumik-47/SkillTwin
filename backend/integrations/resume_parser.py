"""
Resume Parser Integration Module
Extracts skill mentions and supporting evidence snippets from resumes.
Maps extracted competencies to SkillTwin domain knowledge graph IDs.
Detected skills are assigned low-confidence estimated priors (0.40 - 0.50).
"""
import re
import logging
from typing import List, Dict, Any, Optional

from backend.config import settings

logger = logging.getLogger("skilltwin.integrations.resume")

# Domain skill keyword lookup matrix
SKILL_KEYWORD_MAP = {
    "http_basics": ["http", "https", "rest api", "status codes", "http/2", "headers", "web protocols"],
    "tcp_ip_sockets": ["tcp", "ip", "sockets", "udp", "three-way handshake", "networking", "network stack"],
    "dns_resolution": ["dns", "route53", "nameservers", "cname", "a record", "domain resolution"],
    "tls_encryption": ["tls", "ssl", "certificates", "https", "encryption", "pki", "cryptography"],
    "restful_api_design": ["rest", "restful", "api design", "json api", "swagger", "openapi", "endpoints"],
    "sql_query_optimization": ["sql", "query optimization", "explain analyze", "indexing", "postgresql", "mysql"],
    "indexing_b_trees": ["b-tree", "database index", "composite index", "query tuning", "covering index"],
    "acid_transactions": ["acid", "transactions", "isolation levels", "postgresql transactions", "mvcc"],
    "redis_key_value": ["redis", "in-memory cache", "key-value store", "caching", "memcached"],
    "caching_patterns": ["cache-aside", "write-through", "ttl", "cache invalidation", "distributed cache"],
    "jwt_token_auth": ["jwt", "json web token", "jwt authentication", "token auth", "oauth", "refresh token"],
    "docker_containerization": ["docker", "dockerfile", "containers", "containerization", "multi-stage build"],
    "docker_compose_workflows": ["docker compose", "multi-container", "compose.yml", "docker-compose"],
    
    # Python
    "python_syntax_variables": ["python", "python3", "dynamic typing", "pep8", "python fundamentals"],
    "control_flow": ["conditionals", "control flow", "pattern matching", "if-else"],
    "loops_iteration": ["loops", "iteration", "generators", "iterators", "enumerate"],
    "functions_and_scopes": ["functions", "lambdas", "args kwargs", "python scope", "closures"],
    "lists_and_tuples": ["data structures", "lists", "tuples", "collections", "slicing"],
    "dicts_and_sets": ["dictionaries", "hash maps", "sets", "hash tables"],
    "exceptions_handling": ["exception handling", "try except", "error handling"],
    "oop_classes_instances": ["object oriented", "oop", "classes", "inheritance", "polymorphism"],
    "unit_testing_pytest": ["pytest", "unit testing", "mocking", "test suites", "tdd"],
    
    # Web Basics
    "html_semantic_markup": ["html5", "semantic html", "aria", "web accessibility", "accessibility"],
    "css_box_model": ["css3", "css box model", "css specificity", "styling"],
    "css_flexbox": ["flexbox", "css flex", "responsive layout"],
    "css_grid": ["css grid", "grid layout", "2d grid"],
    "responsive_design": ["responsive design", "media queries", "mobile-first", "fluid design"],
    "js_syntax_types": ["javascript", "es6", "es2020", "typescript", "modern js"],
    "dom_manipulation": ["dom", "dom manipulation", "vanilla js", "queryselector"],
    "promises_async_await": ["async await", "promises", "asynchronous javascript", "event loop"],
    "fetch_api_http": ["fetch api", "axios", "ajax", "api consumption"],
    
    # Data Analysis
    "numpy_ndarray_basics": ["numpy", "ndarray", "matrix computation", "numerical python"],
    "numpy_indexing_slicing": ["array slicing", "boolean masking", "fancy indexing"],
    "numpy_broadcasting_vectorization": ["vectorization", "broadcasting", "ufuncs"],
    "numpy_statistical_aggregations": ["statistical analysis", "mean std", "data aggregation"],
    "pandas_series_dataframes": ["pandas", "dataframes", "series", "data analysis", "data manipulation"],
    "pandas_io_csv_json": ["read_csv", "parquet", "data ingestion", "etl"],
    "pandas_missing_data_imputation": ["data cleaning", "missing data", "imputation", "fillna"],
    "pandas_groupby_aggregations": ["groupby", "aggregations", "split apply combine", "pivot tables"],
    "eda_visualization_basics": ["matplotlib", "seaborn", "data visualization", "exploratory data analysis", "eda"]
}


class ResumeParser:
    """Extracts detected skills with evidence snippets from resumes."""

    @classmethod
    def parse_text(cls, text: str) -> List[Dict[str, Any]]:
        cleaned_text = text.lower()
        sentences = re.split(r'[\n\.\•\-\*]+', text)
        detected_skills: List[Dict[str, Any]] = []
        matched_ids = set()

        for skill_id, keywords in SKILL_KEYWORD_MAP.items():
            for kw in keywords:
                if kw in cleaned_text and skill_id not in matched_ids:
                    # Find snippet
                    snippet = None
                    for sent in sentences:
                        if kw in sent.lower() and len(sent.strip()) > 10:
                            snippet = sent.strip()[:140]
                            break
                    if not snippet:
                        snippet = f"Relevant experience with {kw} highlighted in background."

                    matched_ids.add(skill_id)
                    detected_skills.append({
                        "skill_id": skill_id,
                        "skill_name": skill_id.replace("_", " ").title(),
                        "estimated_mastery": 0.45,
                        "confidence": 0.50,
                        "source": "resume",
                        "is_verified": False,
                        "evidence_snippet": snippet
                    })
                    break

        return detected_skills
