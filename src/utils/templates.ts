export interface MermaidTemplate {
  description: string;
  example: string;
  template: string;
  rules: string[];
}

export const MermaidTemplates: Record<string, MermaidTemplate> = {
  flowchart: {
    description: "Flowchart dengan arah top-down (TD) atau left-right (LR).",
    example: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[End]`,
    template: `graph TD
    NODE1[Label1] --> NODE2[Label2]`,
    rules: [
      "Gunakan 'graph TD' untuk top-down",
      "Gunakan 'graph LR' untuk left-right",
      "Node berbentuk kotak: [text], lingkaran: ((text)), diamond: {text}"
    ]
  },
  sequence: {
    description: "Diagram sequence untuk interaksi antar objek.",
    example: `sequenceDiagram
    Alice->>John: Hello John
    John-->>Alice: Hi Alice`,
    template: `sequenceDiagram
    participant A
    participant B
    A->>B: Message`,
    rules: [
      "Mulai dengan 'sequenceDiagram'",
      "Gunakan '->>' untuk panah solid, '-->>' untuk dashed",
      "Gunakan 'participant' untuk mendefinisikan aktor"
    ]
  },
  mindmap: {
    description: "Mindmap untuk brainstorming.",
    example: `mindmap
    root((Mindmap))
        Topic1
            Subtopic1
        Topic2`,
    template: `mindmap
    root((TOPIC))
        Branch1
            Leaf1
        Branch2`,
    rules: [
      "Mulai dengan 'mindmap'",
      "Gunakan indentasi untuk hierarki",
      "Root node menggunakan double parentheses: ((text))"
    ]
  },
  classDiagram: {
    description: "Class diagram untuk desain OOP.",
    example: `classDiagram
    class Animal {
        +String name
        +makeSound() void
    }
    class Dog {
        +fetch() void
    }
    Animal <|-- Dog`,
    template: `classDiagram
    class ClassName {
        +type attribute
        +method() returnType
    }`,
    rules: [
      "Mulai dengan 'classDiagram'",
      "+ untuk public, - untuk private, # untuk protected",
      "Gunakan <|-- untuk inheritance"
    ]
  },
  erDiagram: {
    description: "Entity-Relationship diagram untuk desain database.",
    example: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains`,
    template: `erDiagram
    ENTITY1 ||--o{ ENTITY2 : relationship`,
    rules: [
      "Mulai dengan 'erDiagram'",
      "|| satu, o{ banyak (zero or more), |{ satu atau lebih",
      "Nama relasi ditulis setelah titik dua"
    ]
  },
  stateDiagram: {
    description: "State diagram untuk mesin keadaan.",
    example: `stateDiagram-v2
    [*] --> Still
    Still --> Moving
    Moving --> Stopped
    Stopped --> [*]`,
    template: `stateDiagram-v2
    [*] --> State1
    State1 --> State2 : Event
    State2 --> [*]`,
    rules: [
      "Gunakan 'stateDiagram-v2' untuk versi terbaru",
      "[*] adalah state awal/akhir",
      "Transisi: State1 --> State2 : label"
    ]
  },
  gantt: {
    description: "Gantt chart untuk penjadwalan proyek.",
    example: `gantt
    title Project Schedule
    dateFormat YYYY-MM-DD
    section Phase 1
    Task 1 :2024-01-01, 7d
    Task 2 :2024-01-08, 5d`,
    template: `gantt
    title PROJECT_TITLE
    dateFormat YYYY-MM-DD
    section Section1
    Task1 :YYYY-MM-DD, Nd`,
    rules: [
      "Mulai dengan 'gantt'",
      "dateFormat menentukan format tanggal",
      "Durasi: 7d = 7 hari, 2w = 2 minggu"
    ]
  },
  pie: {
    description: "Pie chart untuk visualisasi proporsi.",
    example: `pie title Browser Usage
    "Chrome" : 65
    "Firefox" : 15
    "Safari" : 12
    "Other" : 8`,
    template: `pie title CHART_TITLE
    "Label1" : value1
    "Label2" : value2`,
    rules: [
      "Mulai dengan 'pie'",
      "title diikuti judul chart",
      "Nilai berupa angka numerik"
    ]
  },
  journey: {
    description: "User journey diagram untuk memetakan pengalaman pengguna dalam menyelesaikan sebuah alur/tugas.",
    example: `journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me`,
    template: `journey
    title JOURNEY_TITLE
    section Section1
      Task1: score: Actor1
      Task2: score: Actor1, Actor2
    section Section2
      Task3: score: Actor1`,
    rules: [
      "Mulai dengan 'journey'",
      "title (opsional) untuk judul diagram",
      "Gunakan 'section' untuk membagi fase/tahapan",
      "Format task: 'Task name: score: Actor1, Actor2'",
      "Score adalah angka 1–5 (1=sulit/buruk, 5=mudah/baik)",
      "Beberapa actor dipisahkan dengan koma"
    ]
  }
};
