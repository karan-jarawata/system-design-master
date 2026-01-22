# System Design Master

**Live Access:** https://karan-jarawata.github.io/system-design-master/

This project is a personal roadmap and progress tracker for mastering System Design. It is split into two distinct tracks: Low-Level Design (LLD) for code architecture and High-Level Design (HLD) for scalable systems.

## Content Overview

### Part 1: Low-Level Design (LLD)
Focuses on writing clean, maintainable, and thread-safe code.
* **Runtime Anatomy:** Stack vs. Heap, Memory Management.
* **OOP Physics:** SOLID Principles, Composition vs. Inheritance.
* **Design Patterns:** Singleton, Factory, Strategy, Observer, etc.
* **Concurrency:** Locks, Atomics, ExecutorService.
* **Machine Coding:** Splitwise, Parking Lot, Elevator System, Tic-Tac-Toe.

### Part 2: High-Level Design (HLD)
Focuses on architecture, scalability, and distributed systems.
* **Core Concepts:** CAP Theorem, Consistent Hashing.
* **Components:** Load Balancers, API Gateways, CDNs, Redis.
* **Database Design:** Sharding, Replication, NoSQL vs. SQL.
* **System Design Case Studies:** WhatsApp, Uber, Netflix, TinyURL.

## Project Features
* **Dual Mode:** Toggle between LLD and HLD curricula.
* **Progress Tracking:** Automatically saves your progress to LocalStorage.
* **Study Notes:** Deep-dive notes, diagrams, and code examples.

## ✌️ Contribution

If you spot a wrong pattern or want to add a new system design problem, feel free to open a PR.

**How to add new content:**
Everything is driven by the JSON files in the `/data` folder.

1.  **Add the Topic:** Open `lld.json` or `hld.json` and add your topic to the relevant group.
2.  **Add the Details:** Open `details.json` and add the content block using the exact same name as the key.
    * `"type": "text"` allows HTML (use `<p>`, `<ul>`, `<b>`).
    * `"type": "code"` renders syntax-highlighted Java/SQL blocks.

Happy Grinding.