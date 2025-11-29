/**
 * Tutorial System
 * Interactive Solidity tutorials with step-by-step lessons
 */

export interface Tutorial {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number; // in minutes
    lessons: Lesson[];
    tags: string[];
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    content: string;
    code: string;
    solution?: string;
    hints: string[];
    validation?: (code: string) => ValidationResult;
}

export interface ValidationResult {
    passed: boolean;
    message: string;
    errors?: string[];
}

export interface TutorialProgress {
    tutorialId: string;
    currentLessonIndex: number;
    completedLessons: string[];
    startedAt: Date;
    lastAccessedAt: Date;
}

/**
 * Built-in tutorials
 */
export const tutorials: Tutorial[] = [
    {
        id: 'solidity-basics',
        title: 'Solidity Basics',
        description: 'Learn the fundamentals of Solidity smart contract development',
        difficulty: 'beginner',
        estimatedTime: 30,
        tags: ['basics', 'syntax', 'variables'],
        lessons: [
            {
                id: 'hello-world',
                title: 'Hello World Contract',
                description: 'Create your first Solidity smart contract',
                content: `# Hello World Contract

Welcome to Solidity! Let's create your first smart contract.

## What you'll learn:
- Contract structure
- State variables
- Basic functions

## Instructions:
1. Define a contract called \`HelloWorld\`
2. Add a public string variable called \`message\`
3. Create a constructor that sets the message
4. Add a function to get the message`,
                code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    // Add your code here
    
}`,
                solution: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string public message;
    
    constructor(string memory _message) {
        message = _message;
    }
    
    function getMessage() public view returns (string memory) {
        return message;
    }
}`,
                hints: [
                    'Use the `string` type for text data',
                    'The `public` keyword automatically creates a getter function',
                    'Constructor runs once when the contract is deployed'
                ],
                validation: (code: string) => {
                    const hasContract = /contract\s+HelloWorld/.test(code);
                    const hasMessage = /string\s+(public\s+)?message/.test(code);
                    const hasConstructor = /constructor/.test(code);

                    if (!hasContract) {
                        return { passed: false, message: 'Contract HelloWorld not found' };
                    }
                    if (!hasMessage) {
                        return { passed: false, message: 'Missing message variable' };
                    }
                    if (!hasConstructor) {
                        return { passed: false, message: 'Missing constructor' };
                    }

                    return { passed: true, message: 'Great job! You created your first contract!' };
                }
            },
            {
                id: 'storage-types',
                title: 'Storage and Memory',
                description: 'Understand data locations in Solidity',
                content: `# Storage and Memory

Learn about different data locations in Solidity.

## What you'll learn:
- Storage vs Memory
- State variables
- Local variables

## Instructions:
1. Create a contract called \`DataLocations\`
2. Add a storage array of numbers
3. Add a function to add numbers to the array
4. Add a function that uses memory for temporary data`,
                code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataLocations {
    // Add your code here
    
}`,
                solution: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataLocations {
    uint256[] public numbers;
    
    function addNumber(uint256 _number) public {
        numbers.push(_number);
    }
    
    function getSum() public view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < numbers.length; i++) {
            sum += numbers[i];
        }
        return sum;
    }
}`,
                hints: [
                    'Arrays in storage persist between function calls',
                    'Use `memory` for temporary variables in functions',
                    'The `push` method adds elements to arrays'
                ]
            }
        ]
    },
    {
        id: 'erc20-token',
        title: 'Create an ERC20 Token',
        description: 'Build a standard ERC20 token from scratch',
        difficulty: 'intermediate',
        estimatedTime: 45,
        tags: ['tokens', 'standards', 'erc20'],
        lessons: [
            {
                id: 'erc20-basics',
                title: 'ERC20 Token Basics',
                description: 'Understand the ERC20 standard',
                content: `# ERC20 Token Standard

Learn how to create a fungible token following the ERC20 standard.

## What you'll learn:
- Token balances
- Transfer function
- Allowances

## Instructions:
1. Create a contract called \`MyToken\`
2. Implement balance tracking
3. Add transfer functionality
4. Implement the approve/transferFrom pattern`,
                code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name = "My Token";
    string public symbol = "MTK";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    // Add your code here
}`,
                solution: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name = "My Token";
    string public symbol = "MTK";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * 10 ** decimals;
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    function approve(address _spender, uint256 _value) public returns (bool) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Allowance exceeded");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}`,
                hints: [
                    'Use mappings to track balances',
                    'Always check balances before transfers',
                    'Emit events for important state changes'
                ]
            }
        ]
    }
];

/**
 * Get tutorial by ID
 */
export function getTutorial(id: string): Tutorial | undefined {
    return tutorials.find(t => t.id === id);
}

/**
 * Get all tutorials
 */
export function getAllTutorials(): Tutorial[] {
    return tutorials;
}

/**
 * Get tutorials by difficulty
 */
export function getTutorialsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Tutorial[] {
    return tutorials.filter(t => t.difficulty === difficulty);
}

/**
 * Save tutorial progress
 */
export function saveTutorialProgress(progress: TutorialProgress): void {
    const key = `tutorial_progress_${progress.tutorialId}`;
    localStorage.setItem(key, JSON.stringify(progress));
}

/**
 * Load tutorial progress
 */
export function loadTutorialProgress(tutorialId: string): TutorialProgress | null {
    const key = `tutorial_progress_${tutorialId}`;
    const data = localStorage.getItem(key);

    if (!data) return null;

    const progress = JSON.parse(data);
    progress.startedAt = new Date(progress.startedAt);
    progress.lastAccessedAt = new Date(progress.lastAccessedAt);

    return progress;
}

/**
 * Mark lesson as completed
 */
export function markLessonCompleted(tutorialId: string, lessonId: string): void {
    const progress = loadTutorialProgress(tutorialId) || {
        tutorialId,
        currentLessonIndex: 0,
        completedLessons: [],
        startedAt: new Date(),
        lastAccessedAt: new Date()
    };

    if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
    }

    progress.lastAccessedAt = new Date();
    saveTutorialProgress(progress);
}
