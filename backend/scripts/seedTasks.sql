-- KODESK Sample Tasks Seed Data
-- This script populates the database with sample coding tasks

-- NOTE: We ensure each supported language has exactly 10 quests (level 1..10) and that each quest unlocks a single mini-game.

-- Python Tasks (levels 1..10)
INSERT INTO tasks (title, description, language, difficulty_level, level_number, prerequisite_task_id, test_cases, starter_code, solution_code) VALUES
('Hello World','Print "Hello, World!" to the console. This is your first Python program!','python','beginner',1,NULL,'[{"input":"","expected_output":"Hello, World!","is_hidden":false}]'::jsonb,'# Write your code here
print("Hello, World!")','print("Hello, World!")'),
('Add Two Numbers','Write a program that takes two numbers as input and prints their sum.','python','beginner',2,NULL,'[{"input":"5\n3","expected_output":"8","is_hidden":false},{"input":"10\n20","expected_output":"30","is_hidden":false},{"input":"-5\n5","expected_output":"0","is_hidden":true}]'::jsonb,'# Read two numbers and print their sum
a = int(input())
b = int(input())
# Your code here','a = int(input())
b = int(input())
print(a + b)'),
('Check Even or Odd','Write a program that checks if a number is even or odd.','python','beginner',3,NULL,'[{"input":"4","expected_output":"Even","is_hidden":false},{"input":"7","expected_output":"Odd","is_hidden":false},{"input":"0","expected_output":"Even","is_hidden":true}]'::jsonb,'# Check if a number is even or odd
n = int(input())
# Your code here','n = int(input())
if n % 2 == 0:
    print("Even")
else:
    print("Odd")'),
('Find Maximum','Write a program that finds the maximum of three numbers.','python','beginner',4,NULL,'[{"input":"5\n3\n9","expected_output":"9","is_hidden":false},{"input":"10\n20\n15","expected_output":"20","is_hidden":false},{"input":"-5\n-2\n-10","expected_output":"-2","is_hidden":true}]'::jsonb,'# Find maximum of three numbers
a = int(input())
b = int(input())
c = int(input())
# Your code here','a = int(input())
b = int(input())
c = int(input())
print(max(a, b, c))'),
('Calculate Factorial','Write a program to calculate the factorial of a number.','python','intermediate',5,NULL,'[{"input":"5","expected_output":"120","is_hidden":false},{"input":"0","expected_output":"1","is_hidden":false},{"input":"7","expected_output":"5040","is_hidden":true}]'::jsonb,'# Calculate factorial
n = int(input())
# Your code here','n = int(input())
fact = 1
for i in range(1, n + 1):
    fact *= i
print(fact)'),
('Check Prime Number','Write a program to check if a number is prime.','python','intermediate',6,NULL,'[{"input":"7","expected_output":"Prime","is_hidden":false},{"input":"10","expected_output":"Not Prime","is_hidden":false},{"input":"2","expected_output":"Prime","is_hidden":true}]'::jsonb,'# Check if number is prime
n = int(input())
# Your code here','n = int(input())
if n < 2:
    print("Not Prime")
else:
    is_prime = True
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            is_prime = False
            break
    print("Prime" if is_prime else "Not Prime")'),
('Reverse a String','Write a program to reverse a string.','python','beginner',7,NULL,'[{"input":"hello","expected_output":"olleh","is_hidden":false},{"input":"Python","expected_output":"nohtyP","is_hidden":false},{"input":"12345","expected_output":"54321","is_hidden":true}]'::jsonb,'# Reverse a string
s = input()
# Your code here','s = input()
print(s[::-1])'),
('Fibonacci Sequence','Write a program to print the first n numbers of the Fibonacci sequence.','python','intermediate',8,NULL,'[{"input":"5","expected_output":"0 1 1 2 3","is_hidden":false},{"input":"7","expected_output":"0 1 1 2 3 5 8","is_hidden":false},{"input":"10","expected_output":"0 1 1 2 3 5 8 13 21 34","is_hidden":true}]'::jsonb,'# Print first n Fibonacci numbers
n = int(input())
# Your code here','n = int(input())
a, b = 0, 1
result = []
for i in range(n):
    result.append(str(a))
    a, b = b, a + b
print(" ".join(result))'),
('List Comprehensions','Use a list comprehension to square numbers from 1..n and print them space-separated.','python','intermediate',9,NULL,'[{"input":"5","expected_output":"1 4 9 16 25","is_hidden":false},{"input":"3","expected_output":"1 4 9","is_hidden":true}]'::jsonb,'# List comprehensions
n = int(input())
# Your code here','n = int(input())
print(" ".join(str(i*i) for i in range(1, n+1)))'),
('File I/O Basics','Read lines from input and print them reversed (simple file I/O).','python','intermediate',10,NULL,'[{"input":"hello","expected_output":"olleh","is_hidden":false}]'::jsonb,'# File I/O basics
s = input()
# Your code here','s = input()
print(s[::-1])');

-- Java Tasks (levels 1..10)
INSERT INTO tasks (title, description, language, difficulty_level, level_number, prerequisite_task_id, test_cases, starter_code, solution_code) VALUES
('Hello World','Print "Hello, World!" to the console. This is your first Java program!','java','beginner',1,NULL,'[{"input":"","expected_output":"Hello, World!","is_hidden":false}]'::jsonb,'public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n        System.out.println("Hello, World!");\n    }\n}','public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'),
('Add Two Numbers','Write a program that takes two numbers as input and prints their sum.','java','beginner',2,NULL,'[{"input":"5\n3","expected_output":"8","is_hidden":false},{"input":"10\n20","expected_output":"30","is_hidden":false},{"input":"-5\n5","expected_output":"0","is_hidden":true}]'::jsonb,'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        // Your code here\n    }\n}','import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n    }\n}'),
('Check Even or Odd','Write a program that checks if a number is even or odd.','java','beginner',3,NULL,'[{"input":"4","expected_output":"Even","is_hidden":false},{"input":"7","expected_output":"Odd","is_hidden":false},{"input":"0","expected_output":"Even","is_hidden":true}]'::jsonb,'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Your code here\n    }\n}','import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        if (n % 2 == 0) {\n            System.out.println("Even");\n        } else {\n            System.out.println("Odd");\n        }\n    }\n}'),
('Find Maximum','Write a program that finds the maximum of three numbers.','java','beginner',4,NULL,'[{"input":"5\n3\n9","expected_output":"9","is_hidden":false},{"input":"10\n20\n15","expected_output":"20","is_hidden":false},{"input":"-5\n-2\n-10","expected_output":"-2","is_hidden":true}]'::jsonb,'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        int c = sc.nextInt();\n        // Your code here\n    }\n}','import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        int c = sc.nextInt();\n        int max = Math.max(a, Math.max(b, c));\n        System.out.println(max);\n    }\n}'),
('Calculate Factorial','Write a program to calculate the factorial of a number.','java','intermediate',5,NULL,'[{"input":"5","expected_output":"120","is_hidden":false},{"input":"0","expected_output":"1","is_hidden":false},{"input":"7","expected_output":"5040","is_hidden":true}]'::jsonb,'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Your code here\n    }\n}','import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long fact = 1;\n        for (int i = 1; i <= n; i++) {\n            fact *= i;\n        }\n        System.out.println(fact);\n    }\n}'),
('String Reversal','Reverse a string input.','java','beginner',6,NULL,'[{"input":"hello","expected_output":"olleh","is_hidden":false}]'::jsonb,'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        // Your code here\n    }\n}','import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(new StringBuilder(s).reverse().toString());\n    }\n}'),
('Arrays and Loops','Print squares of numbers from 1..n separated by spaces.','java','intermediate',7,NULL,'[{"input":"5","expected_output":"1 4 9 16 25","is_hidden":false}]'::jsonb,'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Your code here\n    }\n}','import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        StringBuilder sb = new StringBuilder();\n        for (int i=1;i<=n;i++) sb.append(i*i).append(i==n?"":" ");\n        System.out.println(sb.toString());\n    }\n}'),
('Basic I/O','Simple file I/O and string manipulation.','java','intermediate',8,NULL,'[{"input":"hello","expected_output":"olleh","is_hidden":false}]'::jsonb,'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        // Your code here\n    }\n}','import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(new StringBuilder(s).reverse().toString());\n    }\n}'),
('Collections Intro','Basic use of lists and collections.','java','intermediate',9,NULL,'[{"input":"3\na\nb\nc","expected_output":"a b c","is_hidden":true}]'::jsonb,'# Placeholder starter','// Placeholder solution'),
('Files and Streams','Read lines and process them (files/streams practice).','java','intermediate',10,NULL,'[{"input":"line1","expected_output":"1 enil","is_hidden":true}]'::jsonb,'# Placeholder starter','// Placeholder solution');

-- C++ Tasks (levels 1..10)
INSERT INTO tasks (title, description, language, difficulty_level, level_number, prerequisite_task_id, test_cases, starter_code, solution_code) VALUES
('Hello World','Print "Hello, World!" to the console. This is your first C++ program!','cpp','beginner',1,NULL,'[{"input":"","expected_output":"Hello, World!","is_hidden":false}]'::jsonb,'#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    cout << "Hello, World!" << endl;\n    return 0;\n}','#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}'),
('Add Two Numbers','Write a program that takes two numbers as input and prints their sum.','cpp','beginner',2,NULL,'[{"input":"5\n3","expected_output":"8","is_hidden":false},{"input":"10\n20","expected_output":"30","is_hidden":false},{"input":"-5\n5","expected_output":"0","is_hidden":true}]'::jsonb,'#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    // Your code here\n    return 0;\n}','#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b << endl;\n    return 0;\n}'),
('Check Even or Odd','Write a program that checks if a number is even or odd.','cpp','beginner',3,NULL,'[{"input":"4","expected_output":"Even","is_hidden":false},{"input":"7","expected_output":"Odd","is_hidden":false},{"input":"0","expected_output":"Even","is_hidden":true}]'::jsonb,'#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Your code here\n    return 0;\n}','#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    if (n % 2 == 0) {\n        cout << "Even" << endl;\n    } else {\n        cout << "Odd" << endl;\n    }\n    return 0;\n}'),
('Find Maximum','Write a program that finds the maximum of three numbers.','cpp','beginner',4,NULL,'[{"input":"5\n3\n9","expected_output":"9","is_hidden":false},{"input":"10\n20\n15","expected_output":"20","is_hidden":false},{"input":"-5\n-2\n-10","expected_output":"-2","is_hidden":true}]'::jsonb,'#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    // Your code here\n    return 0;\n}','#include <iostream>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    cout << max(a, max(b, c)) << endl;\n    return 0;\n}'),
('Calculate Factorial','Write a program to calculate the factorial of a number.','cpp','intermediate',5,NULL,'[{"input":"5","expected_output":"120","is_hidden":false},{"input":"0","expected_output":"1","is_hidden":false},{"input":"7","expected_output":"5040","is_hidden":true}]'::jsonb,'#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Your code here\n    return 0;\n}','#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    long long fact = 1;\n    for (int i = 1; i <= n; i++) {\n        fact *= i;\n    }\n    cout << fact << endl;\n    return 0;\n}'),
('Reverse a String','Reverse a string input.','cpp','beginner',6,NULL,'[{"input":"hello","expected_output":"olleh","is_hidden":false}]'::jsonb,'#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    // Your code here\n    return 0;\n}','#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    reverse(s.begin(), s.end());\n    cout << s << endl;\n    return 0;\n}'),
('Vectors and Loops','Print squares of numbers from 1..n separated by spaces.','cpp','intermediate',7,NULL,'[{"input":"5","expected_output":"1 4 9 16 25","is_hidden":false}]'::jsonb,'#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;cin >> n;\n    // Your code here\n    return 0;\n}','#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;cin >> n;\n    for (int i=1;i<=n;i++) cout << i*i << (i==n?"":" ");\n    cout << endl;\n    return 0;\n}'),
('File I/O Basics','Simple file I/O and string processing.','cpp','intermediate',8,NULL,'[{"input":"hello","expected_output":"olleh","is_hidden":false}]'::jsonb,'#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;getline(cin, s);\n    // Your code here\n    return 0;\n}','#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;getline(cin, s);\n    reverse(s.begin(), s.end());\n    cout << s << endl;\n    return 0;\n}'),
('STL Practice','Intro to STL containers and algorithms.','cpp','intermediate',9,NULL,'[{"input":"3\n1 2 3","expected_output":"1 2 3","is_hidden":true}]'::jsonb,'# Placeholder starter','// Placeholder solution'),
('Streams and Files','Read lines and manipulate (streams & files).','cpp','intermediate',10,NULL,'[{"input":"line1","expected_output":"1 enil","is_hidden":true}]'::jsonb,'# Placeholder starter','// Placeholder solution');

-- Programmatically set prerequisite_task_id for each task: each level N (N>1) will have its prerequisite set to level N-1 for the same language
UPDATE tasks t
SET prerequisite_task_id = sub.prev_id
FROM (
  SELECT curr.id AS curr_id, prev.id AS prev_id
  FROM tasks curr
  JOIN tasks prev ON prev.language = curr.language AND prev.level_number = curr.level_number - 1
) AS sub
WHERE t.id = sub.curr_id;

-- Create a mini-game for each task (10 per language => 30 mini-games)
INSERT INTO games (title, description, level_number, game_type) VALUES
('Python Mini Game 1', 'Mini game for Python level 1', 1, 'mini'),
('Python Mini Game 2', 'Mini game for Python level 2', 2, 'mini'),
('Python Mini Game 3', 'Mini game for Python level 3', 3, 'mini'),
('Python Mini Game 4', 'Mini game for Python level 4', 4, 'mini'),
('Python Mini Game 5', 'Mini game for Python level 5', 5, 'mini'),
('Python Mini Game 6', 'Mini game for Python level 6', 6, 'mini'),
('Python Mini Game 7', 'Mini game for Python level 7', 7, 'mini'),
('Python Mini Game 8', 'Mini game for Python level 8', 8, 'mini'),
('Python Mini Game 9', 'Mini game for Python level 9', 9, 'mini'),
('Python Mini Game 10', 'Mini game for Python level 10', 10, 'mini'),
('Java Mini Game 1', 'Mini game for Java level 1', 1, 'mini'),
('Java Mini Game 2', 'Mini game for Java level 2', 2, 'mini'),
('Java Mini Game 3', 'Mini game for Java level 3', 3, 'mini'),
('Java Mini Game 4', 'Mini game for Java level 4', 4, 'mini'),
('Java Mini Game 5', 'Mini game for Java level 5', 5, 'mini'),
('Java Mini Game 6', 'Mini game for Java level 6', 6, 'mini'),
('Java Mini Game 7', 'Mini game for Java level 7', 7, 'mini'),
('Java Mini Game 8', 'Mini game for Java level 8', 8, 'mini'),
('Java Mini Game 9', 'Mini game for Java level 9', 9, 'mini'),
('Java Mini Game 10', 'Mini game for Java level 10', 10, 'mini'),
('C++ Mini Game 1', 'Mini game for C++ level 1', 1, 'mini'),
('C++ Mini Game 2', 'Mini game for C++ level 2', 2, 'mini'),
('C++ Mini Game 3', 'Mini game for C++ level 3', 3, 'mini'),
('C++ Mini Game 4', 'Mini game for C++ level 4', 4, 'mini'),
('C++ Mini Game 5', 'Mini game for C++ level 5', 5, 'mini'),
('C++ Mini Game 6', 'Mini game for C++ level 6', 6, 'mini'),
('C++ Mini Game 7', 'Mini game for C++ level 7', 7, 'mini'),
('C++ Mini Game 8', 'Mini game for C++ level 8', 8, 'mini'),
('C++ Mini Game 9', 'Mini game for C++ level 9', 9, 'mini'),
('C++ Mini Game 10', 'Mini game for C++ level 10', 10, 'mini');

-- Link each mini-game to the corresponding task so completing a quest unlocks the mini-game
INSERT INTO game_tasks (game_id, task_id)
SELECT g.id, t.id
FROM games g
JOIN tasks t ON g.level_number = t.level_number
WHERE (g.title LIKE 'Python Mini Game%' AND t.language = 'python')
   OR (g.title LIKE 'Java Mini Game%' AND t.language = 'java')
   OR (g.title LIKE 'C++ Mini Game%' AND t.language = 'cpp');

-- Also add a few curated global games (kept for variety)
INSERT INTO games (title, description, level_number, game_type) VALUES
('Code Quest Adventure', 'Embark on an adventure where you solve coding challenges to progress through levels!', 1, 'adventure'),
('Syntax Master', 'Test your knowledge of programming syntax and win rewards!', 2, 'quiz'),
('Algorithm Race', 'Race against time to solve algorithmic challenges!', 3, 'racing');

