# System Design Master

**Live Access:** https://karan-jarawata.github.io/system-design-master/

This project is a personal roadmap and progress tracker for mastering System Design. It is split into two distinct tracks: Low-Level Design (LLD) for code architecture and High-Level Design (HLD) for scalable systems.

The application includes detailed study notes, code snippets, and interview takeaways for each topic.

## Content Overview

### Part 1: Low-Level Design (LLD)
Focuses on writing clean, maintainable, and thread-safe code.

* **Runtime Anatomy:** Stack vs. Heap, Memory Management, Identity vs. Equality.
* **OOP Physics:** SOLID Principles, Composition vs. Inheritance, Polymorphism.
* **Design Patterns:**
    * *Creational:* Singleton, Builder, Factory, Prototype.
    * *Structural:* Adapter, Facade, Decorator, Proxy.
    * *Behavioral:* Strategy, Observer, Command, State.
* **Concurrency:** Thread safety, Locks, Atomics, ExecutorService, CompletableFuture.
* **Machine Coding:** Practical 45-minute design problems including Splitwise, Parking Lot, Elevator System, and Tic-Tac-Toe.

### Part 2: High-Level Design (HLD)
Focuses on architecture, scalability, and distributed systems.

* **Core Concepts:** CAP Theorem, Consistent Hashing, Availability vs. Consistency, PACELC.
* **Components:** Load Balancers, API Gateways, CDNs, Distributed Caching (Redis).
* **Database Design:** Sharding, Replication, NoSQL vs. SQL, ACID vs. BASE.
* **Distributed Systems:** ZooKeeper, Kafka, MapReduce, GFS.
* **System Design Case Studies:**
    * Design WhatsApp (Chat System)
    * Design Uber (Geospatial)
    * Design Netflix (Video Streaming)
    * Design TinyURL (Unique ID Generation)

## Project Features

* **Dual Mode:** Toggle between LLD and HLD curricula.
* **Progress Tracking:** automatically saves your progress to LocalStorage.
* **Study Notes:** Click on any topic to view deep-dive notes, diagrams, and Java/SQL code examples.
* **Search:** Real-time filtering to find specific patterns or concepts.

## How to Run Locally

Because this application fetches data from JSON files, it requires a local server to avoid CORS errors.

1.  **Clone the repository**
    git clone https://github.com/karan-jarawata/system-design-master.git

2.  **Navigate to the directory**
    cd system-design-master

3.  **Start a local server (Choose one)**

    * **Python 3:**
        python -m http.server 8000

    * **Node.js:**
        npx http-server

    * **VS Code:**
        Open index.html and use the "Live Server" extension.

4.  **Access the App**
    Open http://localhost:8000 in your browser.