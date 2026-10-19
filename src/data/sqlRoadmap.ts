import { RoadmapNode, RoadmapPhaseId } from '../types';

export interface RoadmapPhase {
  id: RoadmapPhaseId;
  phaseNumber: number;
  title: string;
  subtitle: string;
  description: string;
  roadmapShUrl: string;
  badge: string;
  color: string;
  accentBg: string;
  borderClass: string;
  nodes: RoadmapNode[];
}

export interface CareerTrack {
  id: 'sql-data-analyst' | 'sql-backend-dev' | 'sql-data-engineer' | 'sql-dba';
  name: string;
  tagline: string;
  targetRole: string;
  icon: string;
  color: string;
  essentialPhases: RoadmapPhaseId[];
  keyTools: string[];
  recommendedDailyMinutes: number;
}

export const SQL_CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'sql-data-analyst',
    name: 'Data Analyst',
    tagline: 'Answer business questions with filters, aggregates, joins and window functions',
    targetRole: 'Data / Business Analyst',
    icon: 'sparkles',
    color: 'cyan',
    essentialPhases: ['sql-basics', 'sql-aggregates', 'sql-joins', 'sql-subqueries-functions', 'sql-advanced-performance'],
    keyTools: ['PostgreSQL', 'BigQuery', 'Metabase', 'Excel', 'Looker'],
    recommendedDailyMinutes: 20,
  },
  {
    id: 'sql-backend-dev',
    name: 'Backend Developer',
    tagline: 'Design schemas, write safe queries from application code and keep data consistent',
    targetRole: 'Backend Software Engineer',
    icon: 'server',
    color: 'emerald',
    essentialPhases: ['sql-basics', 'sql-ddl-constraints', 'sql-dml', 'sql-joins', 'sql-views-indexes-transactions'],
    keyTools: ['PostgreSQL', 'MySQL', 'Prisma', 'Drizzle', 'Docker'],
    recommendedDailyMinutes: 25,
  },
  {
    id: 'sql-data-engineer',
    name: 'Data Engineer',
    tagline: 'Build pipelines and models that transform raw tables into trusted datasets',
    targetRole: 'Data / Analytics Engineer',
    icon: 'layers',
    color: 'indigo',
    essentialPhases: ['sql-basics', 'sql-ddl-constraints', 'sql-dml', 'sql-aggregates', 'sql-joins', 'sql-subqueries-functions', 'sql-advanced-performance'],
    keyTools: ['dbt', 'Snowflake', 'Airflow', 'Spark SQL', 'PostgreSQL'],
    recommendedDailyMinutes: 30,
  },
  {
    id: 'sql-dba',
    name: 'Database Administrator',
    tagline: 'Keep databases fast, secure and recoverable under real production load',
    targetRole: 'DBA / Database Reliability Engineer',
    icon: 'cpu',
    color: 'purple',
    essentialPhases: ['sql-basics', 'sql-ddl-constraints', 'sql-views-indexes-transactions', 'sql-advanced-performance'],
    keyTools: ['PostgreSQL', 'pg_stat_statements', 'EXPLAIN ANALYZE', 'pgBackRest', 'Grafana'],
    recommendedDailyMinutes: 25,
  },
];

export const SQL_ROADMAP_PHASES: RoadmapPhase[] = [
  // ================= PHASE 1: LEARN THE BASICS & BASIC SYNTAX =================
  {
    id: 'sql-basics',
    phaseNumber: 1,
    title: 'Relational Basics & SQL Syntax',
    subtitle: 'Tables, Keywords, Operators & SELECT',
    description: 'Understand how relational databases organize data, then read it with SELECT, WHERE, ORDER BY and LIMIT.',
    roadmapShUrl: 'https://roadmap.sh/sql',
    badge: 'Data Explorer',
    color: 'cyan',
    accentBg: 'bg-cyan-500/10',
    borderClass: 'border-cyan-400/40',
    nodes: [
      {
        id: 'sql-rm-relational-model',
        phaseId: 'sql-basics',
        title: 'Relational Databases, RDBMS & SQL vs NoSQL',
        roadmapCategory: 'Learn the Basics / What are Relational Databases?',
        description: 'Tables, rows and columns, why relations matter, and when a relational database is the right tool.',
        keyConcepts: ['Tables, rows & columns', 'Data types', 'RDBMS benefits & limits', 'SQL vs NoSQL'],
        unitId: 'sql-unit-1',
        lessonIds: ['sql-lesson-1-3'],
        importance: 'essential',
        icon: 'layers',
        antiBlindQuestion:
          'Why would a bank store account balances in a relational database rather than a schemaless document store? What does the relational model give you that the document store does not?',
        sampleAnswerHint:
          'Relational databases enforce a fixed schema, data types and constraints, and support ACID transactions across multiple tables. A transfer touches two accounts and must be all-or-nothing; foreign keys and constraints stop invalid states. Document stores trade some of these guarantees for flexible shapes and easier horizontal scaling.',
      },
      {
        id: 'sql-rm-select-from',
        phaseId: 'sql-basics',
        title: 'SELECT, FROM & Basic Filtering',
        roadmapCategory: 'Basic SQL Syntax / SELECT',
        description: 'Read data by naming the columns you need and the table they live in, then keep only matching rows.',
        keyConcepts: ['SELECT', 'FROM', 'SELECT * vs named columns', 'WHERE basics'],
        unitId: 'sql-unit-1',
        lessonIds: ['sql-lesson-1-1', 'sql-lesson-1-2'],
        importance: 'essential',
        icon: 'terminal',
        antiBlindQuestion:
          'SELECT * FROM users works fine today. Why do experienced developers still prefer naming columns explicitly in production code?',
        sampleAnswerHint:
          'SELECT * fetches every column, including large ones you do not need, so more data is read and sent. It also breaks silently when columns are added, removed or reordered, and it prevents covering indexes from answering the query. Naming columns documents intent and keeps results stable.',
      },
      {
        id: 'sql-rm-where-operators',
        phaseId: 'sql-basics',
        title: 'WHERE, Operators & NULL Logic',
        roadmapCategory: 'Basic SQL Syntax / Operators',
        description: 'Filter rows with comparison, logical, range, set and pattern operators, and handle NULL correctly.',
        keyConcepts: ['=, <>, <, >', 'AND / OR precedence', 'IN, BETWEEN, LIKE', 'IS NULL'],
        unitId: 'sql-unit-2',
        lessonIds: ['sql-lesson-2-2'],
        importance: 'essential',
        icon: 'sliders',
        antiBlindQuestion:
          'Why does "WHERE phone = NULL" return no rows even when some phones are NULL? And why can "WHERE phone <> \'555\'" also skip the NULL rows?',
        sampleAnswerHint:
          'NULL means unknown, and SQL uses three-valued logic: any comparison with NULL evaluates to UNKNOWN, not TRUE, and WHERE only keeps TRUE rows. So both = NULL and <> \'555\' drop NULL rows. Use IS NULL / IS NOT NULL, or COALESCE, to handle them explicitly.',
      },
      {
        id: 'sql-rm-order-limit',
        phaseId: 'sql-basics',
        title: 'ORDER BY & LIMIT',
        roadmapCategory: 'Data Manipulation / ORDER BY',
        description: 'Sort results deterministically and return only the top rows.',
        keyConcepts: ['ORDER BY ASC / DESC', 'Multiple sort keys', 'LIMIT / OFFSET', 'Unordered sets'],
        unitId: 'sql-unit-2',
        lessonIds: ['sql-lesson-2-1'],
        importance: 'essential',
        icon: 'list',
        antiBlindQuestion:
          'If you run the same SELECT without ORDER BY twice, are the rows guaranteed to come back in the same order? What does that mean for paginating with LIMIT and OFFSET?',
        sampleAnswerHint:
          'No. A table is an unordered set, and the engine may return rows in whatever order is cheapest (plans, parallelism and updates change it). Pagination without a deterministic ORDER BY (ideally ending in a unique column like id) can skip or repeat rows between pages.',
      },
    ],
  },

  // ================= PHASE 2: DDL & DATA CONSTRAINTS =================
  {
    id: 'sql-ddl-constraints',
    phaseNumber: 2,
    title: 'Data Definition & Constraints',
    subtitle: 'CREATE, ALTER, DROP & Keys',
    description: 'Design table structure with DDL and let the database itself reject invalid data.',
    roadmapShUrl: 'https://roadmap.sh/sql',
    badge: 'Schema Builder',
    color: 'sky',
    accentBg: 'bg-sky-500/10',
    borderClass: 'border-sky-400/40',
    nodes: [
      {
        id: 'sql-rm-ddl-tables',
        phaseId: 'sql-ddl-constraints',
        title: 'CREATE, ALTER, DROP & TRUNCATE',
        roadmapCategory: 'Data Definition Language (DDL)',
        description: 'Create and evolve tables, and know the difference between emptying and removing them.',
        keyConcepts: ['CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'TRUNCATE vs DELETE'],
        unitId: 'sql-unit-3',
        lessonIds: ['sql-lesson-3-1'],
        importance: 'essential',
        icon: 'package-plus',
        antiBlindQuestion:
          'What is the difference between DELETE FROM logs, TRUNCATE TABLE logs and DROP TABLE logs? Which one would you pick to empty a 50-million-row log table, and why?',
        sampleAnswerHint:
          'DELETE removes rows one by one (can use WHERE, fires triggers, logs each row). TRUNCATE deallocates all rows at once and keeps the table definition, so it is far faster for emptying a table. DROP removes the table and its structure entirely. To empty but keep the table, TRUNCATE.',
      },
      {
        id: 'sql-rm-constraints',
        phaseId: 'sql-ddl-constraints',
        title: 'Primary Keys, Foreign Keys & Constraints',
        roadmapCategory: 'Data Constraints',
        description: 'Use PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL and CHECK to guarantee data integrity.',
        keyConcepts: ['PRIMARY KEY', 'FOREIGN KEY / REFERENCES', 'UNIQUE & NOT NULL', 'CHECK'],
        unitId: 'sql-unit-3',
        lessonIds: ['sql-lesson-3-2'],
        importance: 'essential',
        icon: 'key',
        antiBlindQuestion:
          'Your application code already validates that every order belongs to an existing user. Why should you still add a FOREIGN KEY constraint in the database?',
        sampleAnswerHint:
          'Application checks can be bypassed: other services, scripts, migrations, race conditions between check and insert, or bugs. A foreign key is enforced by the database on every write, atomically, so orphaned orders are impossible no matter who writes the data. It also documents the relationship.',
      },
    ],
  },

  // ================= PHASE 3: DATA MANIPULATION (DML) =================
  {
    id: 'sql-dml',
    phaseNumber: 3,
    title: 'Data Manipulation',
    subtitle: 'INSERT, UPDATE & DELETE',
    description: 'Add, change and remove rows precisely, without accidentally touching the whole table.',
    roadmapShUrl: 'https://roadmap.sh/sql',
    badge: 'Data Wrangler',
    color: 'teal',
    accentBg: 'bg-teal-500/10',
    borderClass: 'border-teal-400/40',
    nodes: [
      {
        id: 'sql-rm-insert',
        phaseId: 'sql-dml',
        title: 'INSERT INTO & Multi-row Inserts',
        roadmapCategory: 'Data Manipulation Language (DML) / INSERT',
        description: 'Insert rows with explicit column lists, defaults and batched VALUES.',
        keyConcepts: ['INSERT INTO ... VALUES', 'Explicit column lists', 'Multi-row VALUES', 'INSERT ... SELECT'],
        unitId: 'sql-unit-4',
        lessonIds: ['sql-lesson-4-1'],
        importance: 'essential',
        icon: 'package-plus',
        antiBlindQuestion:
          'Why is "INSERT INTO users VALUES (...)" without a column list considered fragile? What happens to it when a teammate adds a new column?',
        sampleAnswerHint:
          'Without a column list, values are matched to columns by position. When a column is added or the order changes, the insert either fails (wrong count) or, worse, silently puts values in the wrong columns. An explicit column list keeps the statement correct as the schema evolves.',
      },
      {
        id: 'sql-rm-update-delete',
        phaseId: 'sql-dml',
        title: 'UPDATE & DELETE Safely',
        roadmapCategory: 'Data Manipulation Language (DML) / UPDATE & DELETE',
        description: 'Change and remove exactly the rows you mean to, and preview before you write.',
        keyConcepts: ['UPDATE ... SET ... WHERE', 'DELETE ... WHERE', 'Preview with SELECT', 'Rows affected'],
        unitId: 'sql-unit-4',
        lessonIds: ['sql-lesson-4-2'],
        importance: 'essential',
        icon: 'refresh-cw',
        antiBlindQuestion:
          'Describe a safe routine for running a one-off UPDATE or DELETE against a production table. What can go wrong if you skip it?',
        sampleAnswerHint:
          'Write the WHERE first and run it as a SELECT (or SELECT COUNT(*)) to see exactly which rows match. Run the change inside a transaction, check the rows-affected count, then COMMIT, or ROLLBACK if it is wrong. Skipping this risks a missing or wrong WHERE that updates or deletes every row.',
      },
    ],
  },

  // ================= PHASE 4: AGGREGATE QUERIES =================
  {
    id: 'sql-aggregates',
    phaseNumber: 4,
    title: 'Aggregate Queries',
    subtitle: 'COUNT, SUM, AVG, GROUP BY & HAVING',
    description: 'Summarize thousands of rows into answers, per group, and filter those groups.',
    roadmapShUrl: 'https://roadmap.sh/sql',
    badge: 'Insight Analyst',
    color: 'emerald',
    accentBg: 'bg-emerald-500/10',
    borderClass: 'border-emerald-400/40',
    nodes: [
      {
        id: 'sql-rm-aggregate-functions',
        phaseId: 'sql-aggregates',
        title: 'COUNT, SUM, AVG, MIN & MAX',
        roadmapCategory: 'Aggregate Queries',
        description: 'Collapse rows into a single value and know how each function treats NULL.',
        keyConcepts: ['COUNT(*) vs COUNT(col)', 'SUM & AVG', 'MIN & MAX', 'NULLs are ignored'],
        unitId: 'sql-unit-5',
        lessonIds: ['sql-lesson-5-1'],
        importance: 'essential',
        icon: 'hash',
        antiBlindQuestion:
          'A ratings column has values 5, 3 and two NULLs. What do COUNT(*), COUNT(rating) and AVG(rating) return, and why might AVG surprise a product manager?',
        sampleAnswerHint:
          'COUNT(*) = 4 rows, COUNT(rating) = 2 non-NULL values, AVG(rating) = (5 + 3) / 2 = 4. Aggregates skip NULLs, so AVG is over rated items only, not all items. If unrated should count as 0, you need AVG(COALESCE(rating, 0)) = 2.',
      },
      {
        id: 'sql-rm-group-by-having',
        phaseId: 'sql-aggregates',
        title: 'GROUP BY & HAVING',
        roadmapCategory: 'Aggregate Queries / GROUP BY & HAVING',
        description: 'Compute aggregates per group and filter groups after aggregation.',
        keyConcepts: ['GROUP BY', 'HAVING vs WHERE', 'Logical query order', 'Grouped vs aggregated columns'],
        unitId: 'sql-unit-5',
        lessonIds: ['sql-lesson-5-2'],
        importance: 'essential',
        icon: 'layers',
        antiBlindQuestion:
          'Why can you write "HAVING COUNT(*) > 1" but not "WHERE COUNT(*) > 1"? Explain using the order in which SQL logically processes a query.',
        sampleAnswerHint:
          'Logical order is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. WHERE filters individual rows before groups exist, so there is no COUNT to test yet. HAVING runs after GROUP BY, when each group has its aggregates, so it can filter on them.',
      },
    ],
  },

  // ================= PHASE 5: JOIN QUERIES =================
  {
    id: 'sql-joins',
    phaseNumber: 5,
    title: 'JOIN Queries',
    subtitle: 'INNER, LEFT, RIGHT, FULL, SELF & CROSS',
    description: 'Combine related tables and choose the join that keeps exactly the rows you need.',
    roadmapShUrl: 'https://roadmap.sh/sql',
    badge: 'Relationship Mapper',
    color: 'indigo',
    accentBg: 'bg-indigo-500/10',
    borderClass: 'border-indigo-400/40',
    nodes: [
      {
        id: 'sql-rm-inner-left-join',
        phaseId: 'sql-joins',
        title: 'INNER JOIN vs LEFT JOIN',
        roadmapCategory: 'JOIN Queries / INNER & LEFT JOIN',
        description: 'Match rows across tables, and keep unmatched rows when absence is the answer.',
        keyConcepts: ['INNER JOIN', 'LEFT JOIN', 'ON conditions', 'Anti-join (IS NULL)'],
        unitId: 'sql-unit-6',
        lessonIds: ['sql-lesson-6-1'],
        importance: 'essential',
        icon: 'git-branch',
        antiBlindQuestion:
          'You LEFT JOIN users to orders and then add "WHERE orders.status = \'paid\'". Users without orders disappear from the result. Why, and how do you fix it?',
        sampleAnswerHint:
          'For users with no orders, the LEFT JOIN fills orders columns with NULL. The WHERE then tests NULL = \'paid\', which is UNKNOWN, so those rows are filtered out, effectively turning it into an INNER JOIN. Move the condition into the ON clause (ON o.user_id = u.id AND o.status = \'paid\') to keep every user.',
      },
      {
        id: 'sql-rm-other-joins',
        phaseId: 'sql-joins',
        title: 'RIGHT, FULL OUTER, SELF & CROSS JOIN',
        roadmapCategory: 'JOIN Queries / Other Join Types',
        description: 'Keep both sides, join a table to itself, or produce every combination.',
        keyConcepts: ['RIGHT JOIN', 'FULL OUTER JOIN', 'Self join & aliases', 'CROSS JOIN (Cartesian product)'],
        unitId: 'sql-unit-6',
        lessonIds: ['sql-lesson-6-2'],
        importance: 'recommended',
        icon: 'split',
        antiBlindQuestion:
          'A query joining orders to products returns 10 times more rows than expected. What are the two most likely causes, and how do you check?',
        sampleAnswerHint:
          'Either the join condition is missing or wrong (producing a partial Cartesian product, like a CROSS JOIN), or the join key is not unique on the side you assumed (one-to-many fan-out). Check the ON clause, and run GROUP BY key HAVING COUNT(*) > 1 on each side to find duplicate keys.',
      },
    ],
  },

  // ================= PHASE 6: SUBQUERIES & ADVANCED FUNCTIONS =================
  {
    id: 'sql-subqueries-functions',
    phaseNumber: 6,
    title: 'Subqueries & Advanced Functions',
    subtitle: 'Nested Queries, CASE, COALESCE & Built-ins',
    description: 'Compose queries inside queries and transform values with conditional, string, numeric and date functions.',
    roadmapShUrl: 'https://roadmap.sh/sql',
    badge: 'Query Composer',
    color: 'violet',
    accentBg: 'bg-violet-500/10',
    borderClass: 'border-violet-400/40',
    nodes: [
      {
        id: 'sql-rm-subqueries',
        phaseId: 'sql-subqueries-functions',
        title: 'Scalar, Nested & Correlated Subqueries',
        roadmapCategory: 'Sub Queries',
        description: 'Use a query result as a value, a list or a table, and know when a subquery runs per row.',
        keyConcepts: ['Scalar subqueries', 'IN / EXISTS', 'Correlated subqueries', 'Derived tables'],
        unitId: 'sql-unit-7',
        lessonIds: ['sql-lesson-7-1'],
        importance: 'essential',
        icon: 'box',
        antiBlindQuestion:
          'What is the difference between a regular subquery and a correlated subquery in how often they run? When would you rewrite a correlated subquery as a JOIN?',
        sampleAnswerHint:
          'A regular subquery is independent and can be evaluated once. A correlated subquery references the outer row, so logically it runs once per outer row. On large tables that can be slow; rewriting it as a JOIN to a grouped derived table (or a window function) lets the optimizer process it in one pass.',
      },
      {
        id: 'sql-rm-conditional-functions',
        phaseId: 'sql-subqueries-functions',
        title: 'CASE, COALESCE, NULLIF & Built-in Functions',
        roadmapCategory: 'Advanced Functions',
        description: 'Branch with CASE, handle NULLs with COALESCE and NULLIF, and use string, numeric and date functions.',
        keyConcepts: ['CASE WHEN', 'COALESCE & NULLIF', 'UPPER, SUBSTRING, CONCAT', 'ROUND, FLOOR, DATE functions'],
        unitId: 'sql-unit-7',
        lessonIds: ['sql-lesson-7-2'],
        importance: 'recommended',
        icon: 'toggle-left',
        antiBlindQuestion:
          'How would you compute a conversion rate as orders / visits without crashing on days with zero visits? Explain what each function in your answer does.',
        sampleAnswerHint:
          'Use orders / NULLIF(visits, 0). NULLIF returns NULL when visits is 0, and dividing by NULL yields NULL instead of a division-by-zero error. Wrap it in COALESCE(..., 0) if you want 0 instead of NULL for display.',
      },
    ],
  },

  // ================= PHASE 7: VIEWS, INDEXES, TRANSACTIONS & SECURITY =================
  {
    id: 'sql-views-indexes-transactions',
    phaseNumber: 7,
    title: 'Views, Indexes, Transactions & Security',
    subtitle: 'ACID, Indexing & Least Privilege',
    description: 'Make databases fast, consistent under concurrency, and safe from misuse.',
    roadmapShUrl: 'https://roadmap.sh/sql',
    badge: 'Data Guardian',
    color: 'amber',
    accentBg: 'bg-amber-500/10',
    borderClass: 'border-amber-400/40',
    nodes: [
      {
        id: 'sql-rm-views',
        phaseId: 'sql-views-indexes-transactions',
        title: 'Creating & Managing Views',
        roadmapCategory: 'Views',
        description: 'Save queries as virtual tables to simplify access and hide sensitive columns.',
        keyConcepts: ['CREATE VIEW', 'Views store queries, not data', 'Updatable views', 'Materialized views'],
        unitId: 'sql-unit-8',
        lessonIds: ['sql-lesson-8-1'],
        importance: 'recommended',
        icon: 'circle-dot',
        antiBlindQuestion:
          'Does a view make a query faster? Explain what is stored when you CREATE VIEW, and how that differs from a materialized view.',
        sampleAnswerHint:
          'A regular view stores only the query text; each SELECT from it runs the underlying query against current data, so it is not faster by itself. A materialized view stores the result rows, so reads are fast but the data is stale until it is refreshed.',
      },
      {
        id: 'sql-rm-indexes',
        phaseId: 'sql-views-indexes-transactions',
        title: 'Indexes & When They Help',
        roadmapCategory: 'Indexes',
        description: 'Speed up lookups with B-tree indexes and understand their write cost.',
        keyConcepts: ['B-tree indexes', 'Read vs write trade-off', 'Composite index column order', 'Sargable conditions'],
        unitId: 'sql-unit-8',
        lessonIds: ['sql-lesson-8-1'],
        importance: 'essential',
        icon: 'zap',
        antiBlindQuestion:
          'Why not simply add an index on every column? And why can WHERE LOWER(email) = \'x\' ignore an index on email?',
        sampleAnswerHint:
          'Every index takes storage and must be updated on every INSERT, UPDATE and DELETE, slowing writes, and the planner can only use a few per query. An index stores the raw email values in sorted order; applying LOWER() to the column means the stored order no longer matches the expression, so the engine scans instead. Use an expression index or normalize data on write.',
      },
      {
        id: 'sql-rm-transactions-acid',
        phaseId: 'sql-views-indexes-transactions',
        title: 'Transactions, ACID & Isolation Levels',
        roadmapCategory: 'Transactions',
        description: 'Group statements with BEGIN, COMMIT, ROLLBACK and SAVEPOINT, and understand ACID guarantees.',
        keyConcepts: ['BEGIN / COMMIT / ROLLBACK', 'SAVEPOINT', 'ACID', 'Isolation levels'],
        unitId: 'sql-unit-8',
        lessonIds: ['sql-lesson-8-2'],
        importance: 'essential',
        icon: 'shield-check',
        antiBlindQuestion:
          'Explain what could go wrong in a money transfer that runs two UPDATE statements without a transaction. Which ACID properties does wrapping them in BEGIN/COMMIT provide?',
        sampleAnswerHint:
          'If the process crashes between the two UPDATEs, one account is debited but the other never credited, and money vanishes. Concurrent transfers could also read balances mid-change. A transaction gives Atomicity (both or neither), Consistency (constraints hold), Isolation (others do not see the half-done state) and Durability (committed results survive crashes).',
      },
      {
        id: 'sql-rm-security',
        phaseId: 'sql-views-indexes-transactions',
        title: 'GRANT, REVOKE, Stored Procedures & SQL Injection',
        roadmapCategory: 'Data Integrity & Security',
        description: 'Apply least privilege, encapsulate logic, and keep user input out of query structure.',
        keyConcepts: ['GRANT & REVOKE', 'Least privilege', 'Parameterized queries', 'Stored procedures'],
        unitId: 'sql-unit-8',
        lessonIds: ['sql-lesson-8-2'],
        importance: 'essential',
        icon: 'shield',
        antiBlindQuestion:
          'Why do parameterized queries prevent SQL injection while escaping quotes by hand is considered risky?',
        sampleAnswerHint:
          'With parameters, the SQL text and the data are sent separately; the database parses the query structure first and treats parameters strictly as values, so input can never become SQL. Manual escaping depends on getting every edge case right (encodings, different quote rules, numeric contexts) and one miss is exploitable.',
      },
    ],
  },

  // ================= PHASE 8: ADVANCED SQL & PERFORMANCE =================
  {
    id: 'sql-advanced-performance',
    phaseNumber: 8,
    title: 'Advanced SQL & Performance',
    subtitle: 'Window Functions, CTEs & Query Optimization',
    description: 'Write analytical queries with window functions and CTEs, and diagnose slow queries with execution plans.',
    roadmapShUrl: 'https://roadmap.sh/sql',
    badge: 'Query Optimizer',
    color: 'rose',
    accentBg: 'bg-rose-500/10',
    borderClass: 'border-rose-400/40',
    nodes: [
      {
        id: 'sql-rm-window-functions',
        phaseId: 'sql-advanced-performance',
        title: 'Window Functions: ROW_NUMBER, RANK, LAG & LEAD',
        roadmapCategory: 'Advanced SQL / Window Functions',
        description: 'Rank, number and compare rows within partitions without collapsing them.',
        keyConcepts: ['OVER (PARTITION BY ... ORDER BY ...)', 'ROW_NUMBER vs RANK vs DENSE_RANK', 'LAG & LEAD', 'Running totals'],
        unitId: 'sql-unit-9',
        lessonIds: ['sql-lesson-9-1'],
        importance: 'essential',
        icon: 'sparkles',
        antiBlindQuestion:
          'What is the key difference between GROUP BY department and a window function with PARTITION BY department? When do you need the window version?',
        sampleAnswerHint:
          'GROUP BY collapses each department into one output row, so individual rows are lost. A window function computes over the partition but keeps every row, adding the result as a column. Use it when you need both the detail and the aggregate, e.g. each employee with their department average or their rank within the department.',
      },
      {
        id: 'sql-rm-ctes-recursive',
        phaseId: 'sql-advanced-performance',
        title: 'CTEs, Recursive Queries & Pivoting',
        roadmapCategory: 'Advanced SQL / Common Table Expressions',
        description: 'Name intermediate steps with WITH, walk hierarchies recursively, and reshape rows into columns.',
        keyConcepts: ['WITH ... AS', 'WITH RECURSIVE', 'Anchor + recursive member', 'Pivot / unpivot'],
        unitId: 'sql-unit-9',
        lessonIds: ['sql-lesson-9-2'],
        importance: 'recommended',
        icon: 'repeat',
        antiBlindQuestion:
          'Walk through how a recursive CTE finds everyone under a given manager in an org chart. What stops it from running forever?',
        sampleAnswerHint:
          'The anchor member selects the starting manager. The recursive member joins employees to the rows produced so far (employee.manager_id = cte.id) to fetch the next level, and UNION ALL appends them. It repeats until an iteration returns no new rows. Cycles in the data can make it loop, so add a depth limit or cycle check.',
      },
      {
        id: 'sql-rm-query-optimization',
        phaseId: 'sql-advanced-performance',
        title: 'Query Optimization & EXPLAIN',
        roadmapCategory: 'Performance Optimization',
        description: 'Read execution plans, project selectively, and write index-friendly predicates and joins.',
        keyConcepts: ['EXPLAIN / EXPLAIN ANALYZE', 'Selective projection', 'Sargable predicates', 'Optimizing joins & subqueries'],
        unitId: 'sql-unit-9',
        lessonIds: ['sql-lesson-9-3'],
        importance: 'recommended',
        icon: 'cpu',
        antiBlindQuestion:
          'A report query takes 30 seconds. Describe, step by step, how you would find and fix the bottleneck instead of guessing.',
        sampleAnswerHint:
          'Run EXPLAIN ANALYZE to see the actual plan: look for sequential scans on large tables, bad row estimates, expensive sorts and nested loops over big inputs. Then fix the specific cause: add or adjust an index on filter and join columns, make predicates sargable, select only needed columns, and rewrite correlated subqueries as joins. Re-run EXPLAIN ANALYZE to confirm.',
      },
    ],
  },
];

export function getAllSqlRoadmapNodes(): RoadmapNode[] {
  return SQL_ROADMAP_PHASES.flatMap((p) => p.nodes);
}

export function getSqlRoadmapNodeById(id: string): RoadmapNode | undefined {
  return getAllSqlRoadmapNodes().find((n) => n.id === id);
}
