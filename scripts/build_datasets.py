# scripts/build_datasets.py
"""
Curates, validates, and writes all 4 domain skill graphs and resources for SkillTwin.
Domains:
1. Backend Engineering (46 nodes)
2. Python Fundamentals (18 nodes)
3. Web Basics (16 nodes)
4. Data Analysis with Pandas & NumPy (16 nodes)
"""
import json
import os
import networkx as nx

def validate_graph(graph_data, domain_name):
    skills = graph_data.get("skills", [])
    dependencies = graph_data.get("dependencies", [])
    resources = graph_data.get("resources", [])
    
    skill_ids = {s["id"] for s in skills}
    assert len(skill_ids) == len(skills), f"Duplicate skill IDs in {domain_name}"
    
    G = nx.DiGraph()
    for s in skills:
        G.add_node(s["id"])
        
    for d in dependencies:
        src = d["source_skill_id"]
        tgt = d["target_skill_id"]
        assert src in skill_ids, f"Missing source skill {src} in {domain_name}"
        assert tgt in skill_ids, f"Missing target skill {tgt} in {domain_name}"
        G.add_edge(src, tgt)
        
    assert nx.is_directed_acyclic_graph(G), f"Graph {domain_name} contains cycles!"
    
    # Check resources
    res_skill_map = {}
    for r in resources:
        assert r["skill_id"] in skill_ids, f"Resource {r['id']} references unknown skill {r['skill_id']} in {domain_name}"
        res_skill_map.setdefault(r["skill_id"], []).append(r["id"])
        
    for s_id in skill_ids:
        assert s_id in res_skill_map and len(res_skill_map[s_id]) >= 3, f"Skill {s_id} in {domain_name} has fewer than 3 resources ({len(res_skill_map.get(s_id, []))})"
        
    print(f"Domain '{domain_name}' validated: {len(skills)} nodes, {len(dependencies)} edges, {len(resources)} resources. Strict DAG verified.")

def create_resource(res_id, skill_id, title, r_type, duration, difficulty, question_text, options, correct_opt):
    return {
        "id": res_id,
        "skill_id": skill_id,
        "title": title,
        "type": r_type,
        "url": f"https://learn.skilltwin.dev/content/{skill_id}/{res_id}",
        "duration_minutes": duration,
        "difficulty": difficulty,
        "quality_score": 0.90 if difficulty == "intermediate" else (0.95 if difficulty == "advanced" else 0.85),
        "content_payload": {
            "summary": f"Mastering {title} with conceptual depth and hands-on exercises.",
            "quiz": {
                "question": question_text,
                "options": options,
                "correct_option": correct_opt,
                "explanation": f"Option {correct_opt} addresses core principles of {title}."
            }
        }
    }

def build_domain_dataset(skills_raw, domain_key, domain_label):
    skills = []
    dependencies = []
    resources = []
    
    for s_id, s_name, diff, dur, prereqs in skills_raw:
        res_ids = [f"res_{s_id}_{i+1:02d}" for i in range(3)]
        skills.append({
            "id": s_id,
            "name": s_name,
            "domain": domain_key,
            "description": f"Comprehensive competency and implementation guidelines for {s_name} in {domain_label}.",
            "difficulty": diff,
            "estimated_duration_minutes": dur,
            "resource_ids": res_ids
        })
        for prereq in prereqs:
            dependencies.append({
                "source_skill_id": prereq,
                "target_skill_id": s_id,
                "dependency_type": "hard_prerequisite",
                "weight": 1.0
            })
            
        # 3 curated resources per node
        resources.append(create_resource(
            res_ids[0], s_id, f"{s_name} Deep Dive Article & Guide",
            "article", max(15, dur // 2), diff,
            f"What is the primary architectural purpose of {s_name}?",
            ["A. Modularity, abstraction, and correct encapsulation", "B. Decreasing hardware clock speeds", "C. Bypassing validation checks", "D. Forcing synchronous thread blocks"],
            "A"
        ))
        resources.append(create_resource(
            res_ids[1], s_id, f"{s_name} Interactive Assessment Quiz",
            "quiz", 15, diff,
            f"Which principle best demonstrates verified mastery of {s_name} in production?",
            ["A. Implementing defensive edge-case handling and resilient design", "B. Suppressing all runtime exceptions", "C. Using unbounded global variables", "D. Omitting test suites"],
            "A"
        ))
        resources.append(create_resource(
            res_ids[2], s_id, f"{s_name} Hands-on Coding Project",
            "coding_exercise", dur, diff,
            f"When implementing a solution for {s_name}, what ensures performance and data integrity?",
            ["A. Leveraging atomic operations, validated schemas, and efficient algorithms", "B. Introducing arbitrary sleep timers", "C. Unbounded memory allocations", "D. Ignoring boundary conditions"],
            "A"
        ))
        
    data = {
        "domain": domain_key,
        "domain_name": domain_label,
        "version": "1.0.0",
        "skills": skills,
        "dependencies": dependencies,
        "resources": resources
    }
    validate_graph(data, domain_label)
    return data

# 1. Python Fundamentals (18 nodes)
py_skills_raw = [
    ("py_syntax_vars", "Python Syntax, Variables & Types", "beginner", 30, []),
    ("py_operators_expressions", "Operators & Boolean Logic", "beginner", 30, ["py_syntax_vars"]),
    ("py_control_flow", "Control Flow, Conditionals & Loops", "beginner", 45, ["py_operators_expressions"]),
    ("py_functions_scope", "Functions, Scope & Docstrings", "beginner", 45, ["py_control_flow"]),
    ("py_data_structures_lists", "Lists, Tuples & Slicing", "beginner", 45, ["py_functions_scope"]),
    ("py_data_structures_dicts", "Dictionaries & Sets Data Structures", "beginner", 45, ["py_data_structures_lists"]),
    ("py_string_manipulation", "String Formatting & Methods", "beginner", 35, ["py_data_structures_lists"]),
    ("py_file_io", "File I/O & Context Managers", "beginner", 40, ["py_functions_scope"]),
    ("py_exception_handling", "Exception Handling & Custom Errors", "intermediate", 45, ["py_file_io"]),
    ("py_modules_packages", "Modules, Packages & Virtualenvs", "intermediate", 40, ["py_functions_scope"]),
    ("py_oop_classes", "OOP: Classes, Attributes & Methods", "intermediate", 60, ["py_functions_scope", "py_data_structures_dicts"]),
    ("py_oop_inheritance", "OOP: Inheritance & Polymorphism", "intermediate", 60, ["py_oop_classes"]),
    ("py_comprehensions", "List, Dict & Set Comprehensions", "intermediate", 35, ["py_data_structures_dicts"]),
    ("py_iterators_generators", "Iterators & yield Generators", "intermediate", 50, ["py_comprehensions"]),
    ("py_decorators", "Higher-Order Functions & Decorators", "advanced", 55, ["py_functions_scope", "py_oop_classes"]),
    ("py_type_hints", "Type Hints & Static Typing (MyPy)", "intermediate", 40, ["py_functions_scope"]),
    ("py_concurrency_basics", "Concurrency (Threading & Asyncio)", "advanced", 60, ["py_iterators_generators"]),
    ("py_testing_pytest", "Unit Testing with Pytest & Mocking", "intermediate", 50, ["py_exception_handling", "py_modules_packages"])
]

# 2. Web Basics (16 nodes)
web_skills_raw = [
    ("web_html_semantics", "Semantic HTML5 Structure & a11y", "beginner", 30, []),
    ("web_html_forms", "HTML5 Forms & Client Validation", "beginner", 35, ["web_html_semantics"]),
    ("web_css_box_model", "CSS Box Model, Spacing & Sizing", "beginner", 40, ["web_html_semantics"]),
    ("web_css_flexbox", "CSS Flexbox Layout Design", "beginner", 45, ["web_css_box_model"]),
    ("web_css_grid", "CSS Grid Systems & Two-Dimensional Layouts", "intermediate", 50, ["web_css_box_model"]),
    ("web_css_responsive", "Responsive Design & Media Queries", "intermediate", 45, ["web_css_flexbox", "web_css_grid"]),
    ("web_css_variables_animations", "Modern CSS: Variables & Animations", "intermediate", 40, ["web_css_responsive"]),
    ("web_js_syntax_types", "Modern JS (ES6+): Syntax, Scope & Types", "beginner", 45, ["web_html_semantics"]),
    ("web_js_functions_arrow", "JS Functions, Arrow Syntax & Closures", "beginner", 45, ["web_js_syntax_types"]),
    ("web_js_arrays_objects", "Array Methods (map/filter) & Destructuring", "beginner", 50, ["web_js_functions_arrow"]),
    ("web_dom_manipulation", "DOM Tree Traversal & Manipulation", "intermediate", 50, ["web_js_arrays_objects", "web_css_box_model"]),
    ("web_event_handling", "Event Listeners & Event Delegation", "intermediate", 45, ["web_dom_manipulation"]),
    ("web_async_promises", "Asynchronous JS: Promises & async/await", "intermediate", 55, ["web_js_functions_arrow"]),
    ("web_fetch_api", "Fetch API & REST API Integration", "intermediate", 50, ["web_async_promises", "web_event_handling"]),
    ("web_browser_storage", "Browser Storage: LocalStorage & Cookies", "intermediate", 35, ["web_js_arrays_objects"]),
    ("web_security_basics", "Web Security: CORS, XSS & CSRF Defense", "advanced", 50, ["web_fetch_api", "web_browser_storage"])
]

# 3. Data Analysis with Pandas & NumPy (16 nodes)
da_skills_raw = [
    ("da_numpy_arrays", "NumPy Arrays & Data Types", "beginner", 35, []),
    ("da_numpy_operations", "NumPy Vectorized Math Operations", "beginner", 40, ["da_numpy_arrays"]),
    ("da_numpy_broadcasting", "Array Slicing & Broadcasting", "intermediate", 45, ["da_numpy_operations"]),
    ("da_pandas_series", "Pandas Series Structure & Indexing", "beginner", 35, ["da_numpy_arrays"]),
    ("da_pandas_dataframes", "Pandas DataFrames & Ingestion (CSV/JSON)", "beginner", 45, ["da_pandas_series"]),
    ("da_data_inspection", "Data Exploration (info, describe, head)", "beginner", 30, ["da_pandas_dataframes"]),
    ("da_indexing_filtering", "DataFrame Boolean Indexing & loc/iloc", "beginner", 45, ["da_pandas_dataframes"]),
    ("da_missing_data", "Handling Missing Values (fillna/dropna)", "intermediate", 40, ["da_indexing_filtering"]),
    ("da_data_cleaning", "Data Type Casting & String Manipulation", "intermediate", 45, ["da_missing_data"]),
    ("da_groupby_aggregations", "GroupBy Operations & Split-Apply-Combine", "intermediate", 55, ["da_indexing_filtering"]),
    ("da_merging_joining", "DataFrame Merging, Joining & Concat", "intermediate", 50, ["da_pandas_dataframes"]),
    ("da_reshaping_pivoting", "Reshaping Data: Pivot Tables & Melt", "intermediate", 45, ["da_groupby_aggregations", "da_merging_joining"]),
    ("da_time_series", "Time Series Analysis & Date Range Resampling", "advanced", 55, ["da_groupby_aggregations"]),
    ("da_visualization_matplotlib", "Data Visualization with Matplotlib", "intermediate", 45, ["da_pandas_dataframes"]),
    ("da_visualization_seaborn", "Statistical Visualization with Seaborn", "intermediate", 45, ["da_visualization_matplotlib"]),
    ("da_eda_case_study", "End-to-End Exploratory Data Analysis Case Study", "advanced", 90, ["da_data_cleaning", "da_groupby_aggregations", "da_visualization_seaborn"])
]

# 4. Backend Engineering (46 nodes)
be_skills_raw = [
    # OS & Fundamentals
    ("be_linux_cli", "Linux Fundamentals & Command Line Tools", "beginner", 40, []),
    ("be_process_threads", "Operating System Processes & Multithreading", "intermediate", 50, ["be_linux_cli"]),
    ("be_memory_io", "Memory Management & File I/O Models", "intermediate", 50, ["be_process_threads"]),
    
    # Networking & Protocols
    ("be_networking_tcp_ip", "Computer Networking: TCP/IP & DNS", "beginner", 45, []),
    ("be_http_https_protocol", "HTTP/1.1 & HTTP/2 Protocols & TLS", "beginner", 45, ["be_networking_tcp_ip"]),
    ("be_rest_api_design", "RESTful API Design & OpenAPI / Swagger", "beginner", 50, ["be_http_https_protocol"]),
    ("be_websockets_grpc", "Real-Time WebSockets & gRPC Protocols", "advanced", 60, ["be_http_https_protocol"]),
    
    # Backend Frameworks & Runtimes
    ("be_python_backend_async", "Asynchronous Programming in Python (asyncio)", "intermediate", 55, ["be_process_threads"]),
    ("be_fastapi_framework", "FastAPI Framework & ASGI Architecture", "intermediate", 60, ["be_rest_api_design", "be_python_backend_async"]),
    ("be_pydantic_validation", "Data Modeling & Validation with Pydantic v2", "intermediate", 40, ["be_fastapi_framework"]),
    
    # Relational Databases & SQL
    ("be_sql_relational_modeling", "Relational Database Modeling & Normalization", "beginner", 50, []),
    ("be_sql_queries_joins", "Advanced SQL Queries, Subqueries & Joins", "intermediate", 55, ["be_sql_relational_modeling"]),
    ("be_indexing_query_opt", "Database Indexing (B-Tree, Hash) & Query Optimization", "intermediate", 60, ["be_sql_queries_joins"]),
    ("be_transactions_acid", "Database Transactions, ACID Guarantees & Isolation Levels", "intermediate", 60, ["be_sql_queries_joins"]),
    ("be_sqlalchemy_orm", "SQLAlchemy 2.0 ORM & Async Engine", "intermediate", 60, ["be_transactions_acid", "be_pydantic_validation"]),
    ("be_database_migrations_alembic", "Database Schema Migrations with Alembic", "intermediate", 45, ["be_sqlalchemy_orm"]),
    
    # NoSQL & Caching
    ("be_nosql_document_stores", "NoSQL Document Databases (MongoDB)", "intermediate", 50, ["be_rest_api_design"]),
    ("be_caching_strategies", "Caching Strategies (Cache-Aside, Write-Through)", "intermediate", 45, ["be_rest_api_design"]),
    ("be_redis_in_memory_cache", "Redis In-Memory Data Store & TTL Expiry", "intermediate", 50, ["be_caching_strategies"]),
    ("be_cdn_edge_caching", "Content Delivery Networks & Edge Caching", "intermediate", 40, ["be_caching_strategies"]),
    
    # Authentication & Security
    ("be_hashing_encryption", "Cryptography: Password Hashing (Bcrypt) & Salting", "beginner", 40, []),
    ("be_jwt_stateless_auth", "Stateless Authentication with JWT Tokens", "intermediate", 50, ["be_hashing_encryption", "be_fastapi_framework"]),
    ("be_oauth2_oidc", "OAuth2 & OpenID Connect Protocols", "advanced", 60, ["be_jwt_stateless_auth"]),
    ("be_api_security_rate_limiting", "API Security: Rate Limiting & OWASP Top 10", "intermediate", 50, ["be_jwt_stateless_auth"]),
    
    # Messaging & Event-Driven Architecture
    ("be_message_broker_fundamentals", "Message Queuing & Broker Fundamentals", "intermediate", 45, ["be_process_threads"]),
    ("be_rabbitmq_task_queues", "RabbitMQ Task Queues & AMQP Protocol", "intermediate", 55, ["be_message_broker_fundamentals"]),
    ("be_kafka_event_streaming", "Apache Kafka Distributed Event Streaming", "advanced", 70, ["be_message_broker_fundamentals"]),
    ("be_background_workers_celery", "Distributed Background Tasks with Celery", "intermediate", 55, ["be_rabbitmq_task_queues", "be_redis_in_memory_cache"]),
    
    # DevOps, Containers & Deployment
    ("be_docker_containerization", "Docker Containerization & Image Optimization", "intermediate", 55, ["be_linux_cli"]),
    ("be_docker_compose_multi_service", "Docker Compose Multi-Container Orchestration", "intermediate", 50, ["be_docker_containerization", "be_redis_in_memory_cache"]),
    ("be_ci_cd_pipelines", "CI/CD Automation with GitHub Actions", "intermediate", 50, ["be_docker_containerization"]),
    ("be_kubernetes_basics", "Kubernetes Pods, Deployments & Services", "advanced", 75, ["be_docker_compose_multi_service"]),
    ("be_cloud_infrastructure_aws_gcp", "Cloud Infrastructure Fundamentals (Compute, VPC, S3)", "intermediate", 60, ["be_docker_containerization"]),
    
    # Observability & Reliability
    ("be_structured_logging", "Structured Logging (JSON) & Log Aggregation", "intermediate", 40, ["be_fastapi_framework"]),
    ("be_metrics_prometheus_grafana", "Metrics Instrumentation with Prometheus & Grafana", "intermediate", 55, ["be_fastapi_framework"]),
    ("be_distributed_tracing_opentelemetry", "Distributed Tracing with OpenTelemetry & Jaeger", "advanced", 60, ["be_structured_logging"]),
    ("be_resilience_circuit_breakers", "Resilience Patterns: Circuit Breakers & Retries", "advanced", 55, ["be_distributed_tracing_opentelemetry"]),
    
    # Microservices & System Design
    ("be_microservices_architecture", "Microservices Design Principles & Boundaries", "intermediate", 60, ["be_rest_api_design", "be_docker_compose_multi_service"]),
    ("be_api_gateway_load_balancing", "API Gateway & Layer 7 Load Balancing (Nginx, Envoy)", "advanced", 60, ["be_microservices_architecture"]),
    ("be_service_discovery", "Service Discovery & Health Checking (Consul/K8s)", "advanced", 55, ["be_api_gateway_load_balancing"]),
    ("be_database_sharding_replication", "Database Read Replication & Sharding Strategies", "advanced", 70, ["be_indexing_query_opt", "be_transactions_acid"]),
    ("be_event_driven_architecture", "Event-Driven Architecture & Event Sourcing (CQRS)", "advanced", 75, ["be_kafka_event_streaming", "be_microservices_architecture"]),
    ("be_distributed_transactions_saga", "Distributed Transactions & SAGA Pattern", "advanced", 75, ["be_event_driven_architecture", "be_transactions_acid"]),
    ("be_system_design_scalability", "High-Throughput System Design & Scalability Patterns", "advanced", 90, ["be_database_sharding_replication", "be_event_driven_architecture", "be_api_gateway_load_balancing"]),
    ("be_production_incident_management", "Production Incident Response & Post-Mortems", "intermediate", 45, ["be_metrics_prometheus_grafana", "be_structured_logging"]),
    ("be_capstone_distributed_system", "Capstone: Production Distributed Backend System", "advanced", 120, ["be_system_design_scalability", "be_resilience_circuit_breakers", "be_ci_cd_pipelines"])
]

def main():
    os.makedirs("data/graphs", exist_ok=True)
    
    # Build all 4 domains
    py_data = build_domain_dataset(py_skills_raw, "python_fundamentals", "Python Programming Fundamentals")
    web_data = build_domain_dataset(web_skills_raw, "web_basics", "Web Basics: HTML, CSS & JavaScript")
    da_data = build_domain_dataset(da_skills_raw, "data_analysis_pandas_numpy", "Data Analysis with Pandas & NumPy")
    be_data = build_domain_dataset(be_skills_raw, "backend_engineering", "Backend Engineering & Distributed Systems")
    
    # Save individual domain files
    with open("data/graphs/python_fundamentals.json", "w", encoding="utf-8") as f:
        json.dump(py_data, f, indent=2)
    with open("data/graphs/web_basics.json", "w", encoding="utf-8") as f:
        json.dump(web_data, f, indent=2)
    with open("data/graphs/data_analysis_pandas_numpy.json", "w", encoding="utf-8") as f:
        json.dump(da_data, f, indent=2)
    with open("data/graphs/backend_engineering.json", "w", encoding="utf-8") as f:
        json.dump(be_data, f, indent=2)
        
    # Save root default data/skill_graph.json and data/resources.json (backed by backend_engineering)
    default_skill_graph = {
        "domain": be_data["domain"],
        "domain_name": be_data["domain_name"],
        "skills": be_data["skills"],
        "dependencies": be_data["dependencies"]
    }
    with open("data/skill_graph.json", "w", encoding="utf-8") as f:
        json.dump(default_skill_graph, f, indent=2)
        
    with open("data/resources.json", "w", encoding="utf-8") as f:
        json.dump(be_data["resources"], f, indent=2)
        
    print("All 4 domain datasets built and validated successfully!")

if __name__ == "__main__":
    main()
