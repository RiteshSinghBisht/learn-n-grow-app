/**
 * Activity question bank
 * Keeps content separate from app logic so future activities can be added safely.
 */
const ACTIVITY_SETS = {
    level_assessment_v1: {
        id: 'level_assessment_v1',
        group: 'self_assessment',
        order: 0,
        title: 'Level Assessment Test',
        navTitle: 'Self Assessment',
        subtitle: 'English Proficiency Test',
        selectorDescription: '30 questions level test',
        instructions: 'Answer all 30 questions. Each question carries 1 mark.',
        totalQuestions: 30,
        passMark: 18,
        timeLimit: 30, // minutes
        reportEnabled: false,
        sections: [
            { name: 'Section A: Grammar', questions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], totalMarks: 10 },
            { name: 'Section B: Vocabulary', questions: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], totalMarks: 10 },
            { name: 'Section C: Sentence Skills', questions: [21, 22, 23, 24, 25], totalMarks: 5 },
            { name: 'Section D: Reading Comprehension', questions: [26, 27, 28, 29, 30], totalMarks: 5 }
        ],
        grading: [
            { grade: 'A+', level: 'Excellent', minScore: 27, maxScore: 30, percentage: '90-100%', remarks: 'Outstanding mastery - Ready for advanced level' },
            { grade: 'A', level: 'Very Good', minScore: 24, maxScore: 26, percentage: '80-89%', remarks: 'Strong proficiency - Minor gaps' },
            { grade: 'B+', level: 'Good', minScore: 21, maxScore: 23, percentage: '70-79%', remarks: 'Good understanding - Needs practice on weak areas' },
            { grade: 'B', level: 'Average', minScore: 18, maxScore: 20, percentage: '60-69%', remarks: 'Fair level - Requires focused revision' },
            { grade: 'C', level: 'Below Average', minScore: 15, maxScore: 17, percentage: '50-59%', remarks: 'Needs improvement - Target grammar/vocabulary' },
            { grade: 'D', level: 'Needs Help', minScore: 0, maxScore: 14, percentage: 'Below 50%', remarks: 'Basic level - Start with foundation worksheets' }
        ],
        questions: [
            // Section A: Grammar (10 questions)
            {
                id: 1,
                type: 'multiple_choice',
                prompt: "She ___ a letter when the phone rang.",
                options: ['writes', 'was writing', 'wrote'],
                correctAnswer: 1, // index of 'was writing'
                explanation: "Use past continuous for an action in progress when another action happened."
            },
            {
                id: 2,
                type: 'multiple_choice',
                prompt: "By next year, they ___ the project.",
                options: ['complete', 'will complete', 'will have completed'],
                correctAnswer: 2, // index of 'will have completed'
                explanation: "Use future perfect for an action that will be completed before a future point."
            },
            {
                id: 3,
                type: 'multiple_choice',
                prompt: "Neither the teacher nor the students ___ happy.",
                options: ['was', 'were', 'is'],
                correctAnswer: 1, // index of 'were'
                explanation: "With 'neither...nor', the verb agrees with the nearest subject (students -> plural)."
            },
            {
                id: 4,
                type: 'multiple_choice',
                prompt: "If it ___ rain, we will stay home.",
                options: ['rains', 'will rain', 'rained'],
                correctAnswer: 0, // index of 'rains'
                explanation: "In first conditional, use present simple after 'if' (not 'will rain')."
            },
            {
                id: 5,
                type: 'multiple_choice',
                prompt: "He ___ to the market yesterday.",
                options: ['go', 'goes', 'went'],
                correctAnswer: 2, // index of 'went'
                explanation: "'Yesterday' indicates past simple tense."
            },
            {
                id: 6,
                type: 'multiple_choice',
                prompt: "The book ___ on the table since morning.",
                options: ['is lying', 'has been lying', 'lies'],
                correctAnswer: 1, // index of 'has been lying'
                explanation: "Use present perfect continuous with 'since' for an action started in past and continuing."
            },
            {
                id: 7,
                type: 'multiple_choice',
                prompt: "You ___ finish your homework before playing.",
                options: ['can', 'must', 'may'],
                correctAnswer: 1, // index of 'must'
                explanation: "'Must' expresses obligation/necessity."
            },
            {
                id: 8,
                type: 'fill_blank',
                prompt: "She is afraid ___ dogs.",
                correctAnswer: 'of',
                normalizedAnswers: ['of'],
                explanation: "'Afraid of' is the correct collocation."
            },
            {
                id: 9,
                type: 'multiple_choice',
                prompt: 'Reported speech: "I am tired," he said. → He said that he ___.',
                options: ['is tired', 'was tired', 'tired'],
                correctAnswer: 1, // index of 'was tired'
                explanation: "In reported speech, present tense changes to past tense."
            },
            {
                id: 10,
                type: 'multiple_choice',
                prompt: "A bunch of keys ___ on the floor.",
                options: ['lie', 'lies', 'lying'],
                correctAnswer: 1, // index of 'lies'
                explanation: "'Bunch' is the singular head noun, so it takes a singular verb: 'lies'."
            },
            // Section B: Vocabulary (10 questions)
            {
                id: 11,
                type: 'multiple_choice',
                prompt: "Synonym of 'brave':",
                options: ['coward', 'courageous', 'weak'],
                correctAnswer: 1, // index of 'courageous'
                explanation: "'Courageous' means brave."
            },
            {
                id: 12,
                type: 'multiple_choice',
                prompt: "Antonym of 'ancient':",
                options: ['old', 'modern', 'new'],
                correctAnswer: 1, // index of 'modern'
                explanation: "'Modern' is the opposite of 'ancient'."
            },
            {
                id: 13,
                type: 'multiple_choice',
                prompt: '"The meeting was ___ due to rain."',
                options: ['postponed', 'postposed', 'preponed'],
                correctAnswer: 0, // index of 'postponed'
                explanation: "'Postpone' means to delay. 'Postponed' is the correct past participle."
            },
            {
                id: 14,
                type: 'multiple_choice',
                prompt: 'Idiom: "Break a leg" means:',
                options: ['hurt yourself', 'good luck', 'run fast'],
                correctAnswer: 1, // index of 'good luck'
                explanation: "'Break a leg' is an idiom meaning 'good luck', especially before a performance."
            },
            {
                id: 15,
                type: 'multiple_choice',
                prompt: 'Choose correct: "Advice" or "advise"? She gave me good ___.',
                options: ['advice', 'advise'],
                correctAnswer: 0, // index of 'advice'
                explanation: "'Advice' is a noun (uncountable), 'advise' is a verb."
            },
            {
                id: 16,
                type: 'multiple_choice',
                prompt: "Synonym of 'diligent':",
                options: ['lazy', 'hardworking', 'careless'],
                correctAnswer: 1, // index of 'hardworking'
                explanation: "'Hardworking' means diligent."
            },
            {
                id: 17,
                type: 'multiple_choice',
                prompt: '"He is ___ his brother."',
                options: ['taller than', 'more tall than'],
                correctAnswer: 0, // index of 'taller than'
                explanation: "Use 'taller than' (not 'more tall than') for comparative of short adjectives."
            },
            {
                id: 18,
                type: 'multiple_choice',
                prompt: "Antonym of 'generous':",
                options: ['kind', 'selfish', 'helpful'],
                correctAnswer: 1, // index of 'selfish'
                explanation: "'Selfish' is the opposite of 'generous'."
            },
            {
                id: 19,
                type: 'multiple_choice',
                prompt: 'Word meaning "very small":',
                options: ['tiny', 'huge', 'big'],
                correctAnswer: 0, // index of 'tiny'
                explanation: "'Tiny' means very small."
            },
            {
                id: 20,
                type: 'multiple_choice',
                prompt: '"Accept" or "except"? I like all fruits ___ mango.',
                options: ['accept', 'except'],
                correctAnswer: 1, // index of 'except'
                explanation: "'Except' means 'not including'. 'Accept' means to receive."
            },
            // Section C: Sentence Skills (5 questions)
            {
                id: 21,
                type: 'rearrange',
                prompt: "Rearrange: school / to / went / I / bus / by",
                correctAnswer: 'I went to school by bus',
                normalizedAnswers: ['i went to school by bus', 'went to school by bus'],
                explanation: "The correct order is: Subject + Verb + Object + Manner/Place."
            },
            {
                id: 22,
                type: 'fill_blank',
                prompt: "The children ___ (play) in the park when it started raining.",
                correctAnswer: 'were playing',
                normalizedAnswers: ['were playing'],
                explanation: "Use past continuous for an action in progress when another action happened."
            },
            {
                id: 23,
                type: 'multiple_choice',
                prompt: "Choose preposition: He is good ___ maths.",
                options: ['in', 'at', 'on'],
                correctAnswer: 1, // index of 'at'
                explanation: "'Good at' is the correct collocation."
            },
            {
                id: 24,
                type: 'multiple_choice',
                prompt: "Modal: You ___ smoke here. (prohibited)",
                options: ['mustn\'t', 'can', 'might'],
                correctAnswer: 0, // index of 'mustn\'t'
                explanation: "'Mustn't' expresses prohibition."
            },
            {
                id: 25,
                type: 'multiple_choice',
                prompt: "Concord: Each of the boys ___ a gift.",
                options: ['have', 'has', 'having'],
                correctAnswer: 1, // index of 'has'
                explanation: "'Each' always takes a singular verb."
            },
            // Section D: Reading Comprehension (5 questions)
            {
                id: 26,
                type: 'reading_comprehension',
                passage: "In a small town, there lived a boy named Amit. He loved reading books about science. Every evening, he went to the library to borrow new books. One day, he found a book on rockets. It explained how rockets work in space. Amit dreamed of becoming an astronaut. His teacher encouraged him to study hard.",
                prompt: "Where did Amit go every evening?",
                correctAnswer: 'library',
                normalizedAnswers: ['library', 'to the library'],
                explanation: "The passage states: 'Every evening, he went to the library to borrow new books.'"
            },
            {
                id: 27,
                type: 'multiple_choice',
                passage: "In a small town, there lived a boy named Amit. He loved reading books about science. Every evening, he went to the library to borrow new books. One day, he found a book on rockets. It explained how rockets work in space. Amit dreamed of becoming an astronaut. His teacher encouraged him to study hard.",
                prompt: "What did the book explain?",
                options: ['animals', 'rockets', 'food'],
                correctAnswer: 1, // index of 'rockets'
                explanation: "The passage states: 'It explained how rockets work in space.'"
            },
            {
                id: 28,
                type: 'reading_comprehension',
                passage: "In a small town, there lived a boy named Amit. He loved reading books about science. Every evening, he went to the library to borrow new books. One day, he found a book on rockets. It explained how rockets work in space. Amit dreamed of becoming an astronaut. His teacher encouraged him to study hard.",
                prompt: "Inference: What does Amit want to be?",
                correctAnswer: 'astronaut',
                normalizedAnswers: ['astronaut', 'an astronaut'],
                explanation: "The passage states: 'Amit dreamed of becoming an astronaut.'"
            },
            {
                id: 29,
                type: 'multiple_choice',
                passage: "In a small town, there lived a boy named Amit. He loved reading books about science. Every evening, he went to the library to borrow new books. One day, he found a book on rockets. It explained how rockets work in space. Amit dreamed of becoming an astronaut. His teacher encouraged him to study hard.",
                prompt: 'Synonym in passage: "Encouraged" means:',
                options: ['stopped', 'motivated', 'ignored'],
                correctAnswer: 1, // index of 'motivated'
                explanation: "In context, 'encouraged' means to give support, confidence, or hope - synonymous with 'motivated'."
            },
            {
                id: 30,
                type: 'multiple_choice',
                passage: "In a small town, there lived a boy named Amit. He loved reading books about science. Every evening, he went to the library to borrow new books. One day, he found a book on rockets. It explained how rockets work in space. Amit dreamed of becoming an astronaut. His teacher encouraged him to study hard.",
                prompt: "True/False: Amit's teacher discouraged him.",
                options: ['True', 'False'],
                correctAnswer: 1, // index of 'False'
                explanation: "The passage says 'His teacher encouraged him to study hard', so the statement is false."
            }
        ]
    },
    modals_have_v1: {
        id: 'modals_have_v1',
        group: 'test_series',
        order: 1,
        title: 'Past Modals',
        navTitle: 'Past Modals',
        subtitle: 'Past Modals Practice',
        selectorDescription: '25 questions on past modals',
        contextLabel: 'Past Modals',
        instructions: 'Fill only the blank phrase (for example: "could have bought").',
        totalQuestions: 25,
        reportEnabled: true,
        questions: [
            {
                id: 1,
                prompt: "I ____ (buy) bread but I didn't know we needed it.",
                category: 'past possibility',
                expectedPhrase: 'could have bought',
                normalizedExpectedPhrase: 'could have bought',
                modelSentence: "I could have bought bread but I didn't know we needed it."
            },
            {
                id: 2,
                prompt: "We ____ (invite) so many people to our party! I'm worried that we won't have enough room for everyone.",
                category: 'past negative advice / regret',
                expectedPhrase: "shouldn't have invited",
                normalizedExpectedPhrase: "shouldn't have invited",
                modelSentence: "We shouldn't have invited so many people to our party! I'm worried that we won't have enough room for everyone."
            },
            {
                id: 3,
                prompt: 'I ____ (start) saving money years ago!',
                category: 'past advice / regret',
                expectedPhrase: 'should have started',
                normalizedExpectedPhrase: 'should have started',
                modelSentence: 'I should have started saving money years ago!'
            },
            {
                id: 4,
                prompt: "We ____ (join) you at the restaurant, but we couldn't get a babysitter.",
                category: 'past willingness',
                expectedPhrase: 'would have joined',
                normalizedExpectedPhrase: 'would have joined',
                modelSentence: "We would have joined you at the restaurant, but we couldn't get a babysitter."
            },
            {
                id: 5,
                prompt: 'The weather ____ (be) any worse!',
                category: 'past negative possibility',
                expectedPhrase: "couldn't have been",
                normalizedExpectedPhrase: "couldn't have been",
                modelSentence: "The weather couldn't have been any worse!"
            },
            {
                id: 6,
                prompt: "I ____ (arrive) on time, even if I'd left earlier. There were dreadful traffic jams all the way.",
                category: 'past negative possibility',
                expectedPhrase: "couldn't have arrived",
                normalizedExpectedPhrase: "couldn't have arrived",
                modelSentence: "I couldn't have arrived on time, even if I'd left earlier. There were dreadful traffic jams all the way."
            },
            {
                id: 7,
                prompt: 'They ____ (win) the football match, but John hurt his ankle.',
                category: 'past possibility',
                expectedPhrase: 'could have won',
                normalizedExpectedPhrase: 'could have won',
                modelSentence: 'They could have won the football match, but John hurt his ankle.'
            },
            {
                id: 8,
                prompt: 'Amanda ____ (finish) the work, but she felt ill and had to go home.',
                category: 'past willingness',
                expectedPhrase: 'would have finished',
                normalizedExpectedPhrase: 'would have finished',
                modelSentence: 'Amanda would have finished the work, but she felt ill and had to go home.'
            },
            {
                id: 9,
                prompt: 'Lucy ____ (leave) earlier. She missed her flight.',
                category: 'past advice / regret',
                expectedPhrase: 'should have left',
                normalizedExpectedPhrase: 'should have left',
                modelSentence: 'Lucy should have left earlier. She missed her flight.'
            },
            {
                id: 10,
                prompt: "We ____ (finish) the game, even if we'd wanted to. It was raining very hard and we had to stop.",
                category: 'past negative possibility',
                expectedPhrase: "couldn't have finished",
                normalizedExpectedPhrase: "couldn't have finished",
                modelSentence: "We couldn't have finished the game, even if we'd wanted to. It was raining very hard and we had to stop."
            },
            {
                id: 11,
                prompt: 'I ____ (eat) so much chocolate! I feel sick!',
                category: 'past negative advice / regret',
                expectedPhrase: "shouldn't have eaten",
                normalizedExpectedPhrase: "shouldn't have eaten",
                modelSentence: "I shouldn't have eaten so much chocolate! I feel sick!"
            },
            {
                id: 12,
                prompt: "Luke ____ (pass) the exam if he'd studied a bit more.",
                category: 'past possibility',
                expectedPhrase: 'could have passed',
                normalizedExpectedPhrase: 'could have passed',
                modelSentence: "Luke could have passed the exam if he'd studied a bit more."
            },
            {
                id: 13,
                prompt: "John ____ (call) Amy, but he didn't have her number.",
                category: 'past willingness',
                expectedPhrase: 'would have called',
                normalizedExpectedPhrase: 'would have called',
                modelSentence: "John would have called Amy, but he didn't have her number."
            },
            {
                id: 14,
                prompt: "You ____ (be) rude to him. He's going to be really angry now.",
                category: 'past negative advice / regret',
                expectedPhrase: "shouldn't have been",
                normalizedExpectedPhrase: "shouldn't have been",
                modelSentence: "You shouldn't have been rude to him. He's going to be really angry now."
            },
            {
                id: 15,
                prompt: "She ____ (come) to the restaurant if she'd left work earlier.",
                category: 'past possibility',
                expectedPhrase: 'could have come',
                normalizedExpectedPhrase: 'could have come',
                modelSentence: "She could have come to the restaurant if she'd left work earlier."
            },
            {
                id: 16,
                prompt: "You ____ (take) this job. I can see you're not enjoying it.",
                category: 'past negative advice / regret',
                expectedPhrase: "shouldn't have taken",
                normalizedExpectedPhrase: "shouldn't have taken",
                modelSentence: "You shouldn't have taken this job. I can see you're not enjoying it."
            },
            {
                id: 17,
                prompt: "The race was really difficult. She ____ (win) because she's not fit enough.",
                category: 'past negative possibility',
                expectedPhrase: "couldn't have won",
                normalizedExpectedPhrase: "couldn't have won",
                modelSentence: "The race was really difficult. She couldn't have won because she's not fit enough."
            },
            {
                id: 18,
                prompt: 'Our neighbours ____ (cut) down the tree in their garden. It was a really beautiful tree.',
                category: 'past negative advice / regret',
                expectedPhrase: "shouldn't have cut",
                normalizedExpectedPhrase: "shouldn't have cut",
                modelSentence: "Our neighbours shouldn't have cut down the tree in their garden. It was a really beautiful tree."
            },
            {
                id: 19,
                prompt: "The children ____ (do) their homework last night. Then they wouldn't be panicking on the way to school.",
                category: 'past advice / regret',
                expectedPhrase: 'should have done',
                normalizedExpectedPhrase: 'should have done',
                modelSentence: "The children should have done their homework last night. Then they wouldn't be panicking on the way to school."
            },
            {
                id: 20,
                prompt: "I'm really cold! I ____ (bring) my coat.",
                category: 'past advice / regret',
                expectedPhrase: 'should have brought',
                normalizedExpectedPhrase: 'should have brought',
                modelSentence: "I'm really cold! I should have brought my coat."
            },
            {
                id: 21,
                prompt: "I ____ (come) to see you! I didn't know you were ill.",
                category: 'past willingness',
                expectedPhrase: 'would have come',
                normalizedExpectedPhrase: 'would have come',
                modelSentence: "I would have come to see you! I didn't know you were ill."
            },
            {
                id: 22,
                prompt: 'Andrew ____ (go) to Cambridge University, but he decided to travel instead.',
                category: 'past possibility',
                expectedPhrase: 'could have gone',
                normalizedExpectedPhrase: 'could have gone',
                modelSentence: 'Andrew could have gone to Cambridge University, but he decided to travel instead.'
            },
            {
                id: 23,
                prompt: 'They ____ (be) kinder to me. They were absolutely lovely.',
                category: 'past negative possibility',
                expectedPhrase: "couldn't have been",
                normalizedExpectedPhrase: "couldn't have been",
                modelSentence: "They couldn't have been kinder to me. They were absolutely lovely."
            },
            {
                id: 24,
                prompt: "You ____ (buy) some milk at the shops. We don't have any milk.",
                category: 'past advice / regret',
                expectedPhrase: 'should have bought',
                normalizedExpectedPhrase: 'should have bought',
                modelSentence: "You should have bought some milk at the shops. We don't have any milk."
            },
            {
                id: 25,
                prompt: 'They ____ (come) to have breakfast with us, but they went to bed too late the night before.',
                category: 'past willingness',
                expectedPhrase: 'would have come',
                normalizedExpectedPhrase: 'would have come',
                modelSentence: 'They would have come to have breakfast with us, but they went to bed too late the night before.'
            }
        ]
    },
    ...buildAdditionalTestSeriesSets()
};

function createFillBlankQuestion(id, prompt, answers, extra = {}) {
    const acceptedAnswers = Array.isArray(answers) ? answers : [answers];
    const displayAnswer = extra.displayAnswer || acceptedAnswers.join(' or ');

    return {
        id,
        type: 'fill_blank',
        prompt,
        correctAnswer: acceptedAnswers[0],
        displayAnswer,
        normalizedAnswers: acceptedAnswers,
        ...extra
    };
}

function createMultipleChoiceQuestion(id, prompt, options, correctAnswer, extra = {}) {
    return {
        id,
        type: 'multiple_choice',
        prompt,
        options,
        correctAnswer,
        ...extra
    };
}

function createTestSeriesSet(config) {
    const questions = config.questions || [];
    return {
        id: config.id,
        group: 'test_series',
        order: config.order,
        title: config.title,
        navTitle: config.navTitle,
        subtitle: config.subtitle,
        selectorDescription: config.selectorDescription || `${questions.length} questions`,
        contextLabel: config.contextLabel || config.navTitle || config.title,
        instructions: config.instructions || `Answer all ${questions.length} questions. Each question carries 1 mark.`,
        totalQuestions: questions.length,
        passMark: config.passMark || Math.ceil(questions.length * 0.6),
        reportEnabled: false,
        sections: config.sections,
        questions
    };
}

function buildAdditionalTestSeriesSets() {
    const subjectVerbAgreement1Questions = [
        [1, 'The boy _____ (play) football every evening.', ['plays']],
        [2, 'My friends _____ (like) to read storybooks.', ['like']],
        [3, 'Each of the students _____ (have) a notebook.', ['has']],
        [4, 'The team _____ (win) the match yesterday.', ['won']],
        [5, 'Neither of the boys _____ (want) to go home early.', ['wants']],
        [6, 'A bunch of flowers _____ (look) beautiful on the table.', ['looks']],
        [7, 'Everyone in the class _____ (know) the answer.', ['knows']],
        [8, 'The children _____ (run) around the playground.', ['run']],
        [9, 'My sister, along with her friends, _____ (visit) the zoo.', ['visits']],
        [10, 'Somebody _____ (leave) the door open.', ['has left', 'left']],
        [11, 'The police _____ (catch) the thief last night.', ['caught']],
        [12, 'Both of my parents _____ (work) in the same office.', ['work']],
        [13, 'One of the books _____ (be) missing from the shelf.', ['is']],
        [14, 'The family _____ (go) on a picnic every weekend.', ['goes']],
        [15, 'Either the cat or the dogs _____ (eat) the food.', ['eat', 'eats']],
        [16, 'Nobody _____ (understand) the joke.', ['understands', 'understood']],
        [17, 'The committee _____ (meet) tomorrow morning.', ['meets']],
        [18, 'My shoes _____ (need) polishing.', ['need', 'needs']],
        [19, 'A number of people _____ (wait) outside.', ['are waiting', 'wait']],
        [20, 'The teacher, as well as the students, _____ (enjoy) the trip.', ['enjoys']],
        [21, 'Everything _____ (seem) perfect today.', ['seems']],
        [22, 'The audience _____ (clap) loudly after the show.', ['clapped', 'claps']],
        [23, 'Any of these apples _____ (taste) good.', ['taste', 'tastes']],
        [24, 'The news _____ (spread) quickly in the village.', ['spreads', 'spread']],
        [25, 'There _____ (be) many stars in the sky tonight.', ['are']]
    ].map(([id, prompt, answers]) => createFillBlankQuestion(id, prompt, answers));

    const subjectVerbAgreement2Questions = [
        [1, 'The flock of birds _____ (fly) south every winter across the vast mountains.', ['flies']],
        [2, 'Neither the coach nor the players _____ (seem) satisfied with the final score.', ['seem', 'seems']],
        [3, 'Each of the five puppies in the litter _____ (need) its own bowl of food.', ['needs']],
        [4, 'The box of chocolates, along with the cookies, _____ (sit) untouched on the counter.', ['sits']],
        [5, 'A majority of the students in our class _____ (prefer) outdoor games during recess.', ['prefer', 'prefers']],
        [6, 'Everyone except my brother and sister _____ (finish) their homework on time.', ['has finished', 'finishes']],
        [7, 'The jury, after hours of debate, finally _____ (reach) a unanimous decision.', ['reached', 'reaches']],
        [8, 'One of my favorite books on the shelf _____ (contain) stories from ancient times.', ['contains']],
        [9, 'Both the manager and his assistant _____ (handle) complaints efficiently every day.', ['handle', 'handles']],
        [10, 'The United States _____ (have) a diverse population from around the world.', ['has']],
        [11, 'Either the apples or the banana in the fruit bowl _____ (go) bad quickly.', ['goes']],
        [12, 'A herd of elephants _____ (trudge) slowly through the dry African savanna.', ['trudges']],
        [13, 'Nobody in the crowded auditorium, filled with excited fans, _____ (know) the outcome yet.', ['knows']],
        [14, 'The teacher, as well as the principal and parents, _____ (attend) the annual function.', ['attends', 'attend']],
        [15, 'Several pieces of furniture in the old attic _____ (require) careful cleaning.', ['require', 'requires']],
        [16, 'The committee of experts _____ (disagree) on the best solution for the problem.', ['disagrees', 'disagree']],
        [17, 'My scissors, which are over there on the desk, _____ (need) sharpening soon.', ['need', 'needs']],
        [18, 'There _____ (be) a number of reasons why the project might get delayed.', ['are']],
        [19, 'Neither rain nor snow nor heat _____ (stop) the dedicated mail carriers.', ['stops']],
        [20, 'The pride of lions _____ (stalk) its prey silently through the tall grass.', ['stalks']],
        [21, 'Everything in the garden, including the roses and tulips, _____ (bloom) beautifully this spring.', ['blooms']],
        [22, 'One-third of the pie that my aunt baked _____ (taste) surprisingly sweet.', ['tastes']],
        [23, 'The staff at the hotel, known for great service, _____ (work) overtime during holidays.', ['works']],
        [24, 'Any of the three options presented by the group leader _____ (sound) reasonable to me.', ['sounds']],
        [25, 'The orchestra, with its talented musicians from different countries, _____ (perform) tonight.', ['performs']]
    ].map(([id, prompt, answers]) => createFillBlankQuestion(id, prompt, answers));

    const mixTensesQuestions = [
        [1, 'She _____ (go) to school every day this month.', ['goes', 'has gone']],
        [2, 'Right now, the children _____ (play) in the park happily.', ['are playing']],
        [3, 'By next week, they _____ (finish) the science project.', ['will have finished']],
        [4, 'He _____ (live) in this city since 2022.', ['has lived']],
        [5, 'Yesterday, we _____ (visit) our grandparents after school.', ['visited']],
        [6, 'She _____ (cook) dinner when the guests arrived.', ['was cooking']],
        [7, 'By tomorrow evening, I _____ (study) for six hours straight.', ['will have been studying']],
        [8, 'Birds _____ (fly) south every winter without fail.', ['fly']],
        [9, 'We _____ (not/see) that movie before last weekend.', ["had not seen", "hadn't seen"]],
        [10, 'He _____ (not/run) every morning this week.', ["has not been running", "hasn't been running"]],
        [11, 'The team _____ (not/win) any matches by the finals.', ["had not won", "hadn't won"]],
        [12, 'She _____ (not/wait) at the bus stop when it rained.', ["was not waiting", "wasn't waiting"]],
        [13, 'They _____ (not/work) on the homework since yesterday.', ["have not been working", "haven't been working"]],
        [14, "Tomorrow at noon, I _____ (not/sleep); I'll be working.", ["will not be sleeping", "won't be sleeping"]],
        [15, 'The children _____ (not/play) outside during the storm.', ["were not playing", "weren't playing"]],
        [16, 'By 2030, scientists _____ (not/solve) all climate problems.', ["will not have solved", "won't have solved"]],
        [17, '_____ you _____ (go) to the market yesterday evening?', ['did go', 'did you go']],
        [18, 'What _____ she _____ (do) in the kitchen right now?', ['is doing', 'is she doing']],
        [19, '_____ they _____ (live) here since last year?', ['have lived', 'have they lived']],
        [20, 'By tomorrow, _____ we _____ (complete) all the assignments?', ['will have completed', 'will we have completed']],
        [21, '_____ the dog _____ (bark) when the thief came?', ['was barking', 'was the dog barking']],
        [22, 'How long _____ he _____ (practice) for the exam this week?', ['has been practicing', 'has he been practicing']],
        [23, '_____ birds _____ (fly) north in summer?', ['do fly', 'do birds fly']],
        [24, 'When _____ you _____ (arrive) at the party last night?', ['did arrive', 'did you arrive']],
        [25, 'Where _____ the students _____ (wait) during the assembly?', ['were waiting', 'were the students waiting']]
    ].map(([id, prompt, answers]) => createFillBlankQuestion(id, prompt, answers));

    const pronounsQuestions = [
        [1, '_____ is my best friend from school.', ['He', 'Him'], 0],
        [2, 'This book belongs to _____.', ['me', 'mine'], 0],
        [3, 'The children picked up _____ toys themselves.', ['theirs', 'themselves'], 1],
        [4, '_____ cake on the table looks delicious.', ['This', 'These'], 0],
        [5, 'I lost _____ pen yesterday.', ['my', 'mine'], 0],
        [6, '_____ dog chased _____ cat up the tree.', ['Their, a', 'Their, the'], 1],
        [7, 'She taught _____ a new dance step.', ['her', 'herself'], 1],
        [8, '_____ are the flowers you wanted?', ['What', 'Which'], 0],
        [9, 'The boy _____ bag was stolen called the police.', ['who', 'whose'], 1],
        [10, 'Give _____ the ball, please.', ['I', 'me'], 1],
        [11, '_____ house is bigger than _____.', ['Their, ours', 'Them, us'], 0],
        [12, 'The cat licked _____.', ['itself', 'it'], 0],
        [13, '_____ books are these on the shelf?', ['Who', 'Whose'], 1],
        [14, '_____ is going to the market with me.', ['She', 'Her'], 0],
        [15, 'They finished the work by _____.', ['them', 'themselves'], 1],
        [16, '_____ is your favorite color?', ['What', 'Which'], 0],
        [17, 'The girl _____ won the prize is my sister.', ['who', 'whom'], 0],
        [18, 'This gift is from _____ to you.', ['me', 'mine'], 0],
        [19, 'We saw _____ in the mirror.', ['ourselves', 'our'], 0],
        [20, '_____ pen is lying on your desk.', ['Your', 'Yours'], 0],
        [21, 'He cut _____ while shaving.', ['himself', 'his'], 0],
        [22, '_____ team scored the most goals?', ['Which', 'Whose'], 0],
        [23, 'The teacher praised _____ for good work.', ['we', 'us'], 1],
        [24, '_____ are my gloves over there.', ['Those', 'That'], 0],
        [25, 'She made the cake _____ .', ['her', 'herself'], 1]
    ].map(([id, prompt, options, correctAnswer]) => createMultipleChoiceQuestion(id, prompt, options, correctAnswer));

    const adjectivesAndAdverbsQuestions = [
        [1, 'She sings very _____ .', ['beautiful', 'beautifully'], 1],
        [2, 'This is the _____ day of the week.', ['good', 'best'], 1],
        [3, 'He runs _____ than his brother.', ['fast', 'faster'], 1],
        [4, 'The _____ girl won the race.', ['tall', 'taller'], 0],
        [5, 'They arrived _____ at the station.', ['early', 'earlier'], 0],
        [6, 'What a _____ view from the mountain!', ['wonder', 'wonderful'], 1],
        [7, 'She speaks English _____ .', ['fluent', 'fluently'], 1],
        [8, 'This bag is _____ expensive than that one.', ['more', 'most'], 0],
        [9, 'The _____ child helped his mother.', ['kind', 'kinder'], 0],
        [10, 'He drives _____ on wet roads.', ['careful', 'carefully'], 1],
        [11, 'It was the _____ movie I have ever seen.', ['good', 'best'], 1],
        [12, 'She dances _____ gracefully.', ['most', 'more'], 0],
        [13, 'The room looks _____ after cleaning.', ['beauty', 'beautiful'], 1],
        [14, 'He works _____ hard every day.', ['too', 'very'], 0],
        [15, 'This is _____ interesting book.', ['a', 'an'], 1],
        [16, 'They play football _____ .', ['aggressive', 'aggressively'], 1],
        [17, 'She is the _____ student in class.', ['smart', 'smartest'], 1],
        [18, 'Walk _____ ; the floor is wet.', ['slow', 'slowly'], 1],
        [19, 'The _____ elephant lifted the log.', ['strong', 'stronger'], 0],
        [20, 'He explained the lesson _____ .', ['clear', 'clearly'], 1],
        [21, 'This chair is _____ comfortable than the old one.', ['much', 'more'], 1],
        [22, 'What an _____ idea!', ['excite', 'exciting'], 1],
        [23, 'She sings _____ than anyone else.', ['loud', 'louder'], 1],
        [24, 'The soup tastes _____ today.', ['delicious', 'deliciously'], 0],
        [25, 'He is _____ reliable than his friend.', ['much', 'more'], 1]
    ].map(([id, prompt, options, correctAnswer]) => createMultipleChoiceQuestion(id, prompt, options, correctAnswer));

    const prepositionQuestions = [
        [1, 'We go to school _____ bus every day.', ['by', 'with', 'on'], 0],
        [2, 'The cat is hiding _____ the table.', ['on', 'under', 'in'], 1],
        [3, 'My birthday is _____ 15th August.', ['on', 'at', 'in'], 0],
        [4, 'She arrived _____ the airport at 5 PM.', ['in', 'at', 'on'], 1],
        [5, 'He is afraid _____ dogs.', ['of', 'from', 'with'], 0],
        [6, 'The book is _____ the shelf.', ['over', 'on', 'between'], 1],
        [7, 'They will meet us _____ the park.', ['at', 'in', 'on'], 0],
        [8, "I wake up _____ 6 o'clock every morning.", ['at', 'on', 'in'], 0],
        [9, 'The letter is written _____ ink.', ['with', 'by', 'in'], 2],
        [10, 'She walked _____ the room quietly.', ['into', 'on', 'at'], 0],
        [11, 'The picture hangs _____ the wall.', ['on', 'in', 'at'], 0],
        [12, 'We live _____ a small village.', ['in', 'on', 'at'], 0],
        [13, 'He cut his finger _____ a knife.', ['by', 'with', 'from'], 1],
        [14, 'The train departs _____ platform 3.', ['from', 'at', 'on'], 0],
        [15, 'She is good _____ mathematics.', ['in', 'at', 'on'], 1],
        [16, 'The children played _____ the rain.', ['under', 'in', 'on'], 1],
        [17, 'Put the keys _____ the table, please.', ['in', 'on', 'at'], 1],
        [18, 'We waited _____ the bus for 30 minutes.', ['for', 'at', 'to'], 0],
        [19, 'The shop closes _____ Sunday.', ['on', 'at', 'in'], 0],
        [20, 'He jumped _____ the swimming pool.', ['into', 'on', 'at'], 0],
        [21, 'The gift is _____ you.', ['from', 'to', 'for'], 0],
        [22, 'She travels _____ train to work.', ['by', 'with', 'on'], 0],
        [23, 'The ball rolled _____ the hill.', ['down', 'up', 'over'], 0],
        [24, 'They sat _____ the shade of the tree.', ['in', 'on', 'at'], 0],
        [25, 'I will call you _____ I reach home.', ['after', 'before', 'when'], 0]
    ].map(([id, prompt, options, correctAnswer]) => createMultipleChoiceQuestion(id, prompt, options, correctAnswer));

    const conjunctionQuestions = [
        [1, 'I wanted to play, _____ it was raining.', ['but', 'so'], 0],
        [2, '_____ you study hard, you will pass the exam.', ['If', 'Because'], 0],
        [3, 'She is tall, _____ her brother is short.', ['and', 'but'], 1],
        [4, 'Hurry up, _____ we will miss the bus.', ['or', 'so'], 0],
        [5, 'He neither smokes _____ drinks.', ['or', 'nor'], 1],
        [6, '_____ it was late, we went home.', ['Although', 'When'], 1],
        [7, 'Both the cat _____ the dog are sleeping.', ['and', 'or'], 0],
        [8, 'I like tea, _____ I prefer coffee.', ['but', 'so'], 0],
        [9, '_____ you apologize, I will forgive you.', ['If', 'Although'], 0],
        [10, 'He ran fast, _____ he missed the train.', ['but', 'and'], 0],
        [11, 'She is poor _____ honest.', ['but', 'or'], 0],
        [12, 'Wait here _____ I return.', ['until', 'because'], 0],
        [13, '_____ it rains, we will cancel the picnic.', ['If', 'And'], 0],
        [14, 'He is smart, _____ lazy sometimes.', ['yet', 'so'], 0],
        [15, '_____ John _____ Mary attended the party so everyone was missing them.', ['Either...or', 'Neither...nor'], 1],
        [16, 'We stayed inside _____ the storm raged outside.', ['while', 'so'], 0],
        [17, 'She cried _____ she was happy.', ['although', 'because'], 1],
        [18, 'Do you want tea _____ coffee?', ['and', 'or'], 1],
        [19, 'He studied hard, _____ he failed.', ['yet', 'so'], 0],
        [20, '_____ she was tired, she continued working.', ['Although', 'If'], 0],
        [21, 'Bring your book _____ your notebook.', ['and', 'but'], 0],
        [22, 'We can go to the park, _____ we can stay home.', ['or', 'so'], 0],
        [23, 'He smiled _____ thanked me.', ['and', 'nor'], 0],
        [24, '_____ you help me, I cannot finish on time.', ['Unless', 'While'], 0],
        [25, 'She sings beautifully, _____ he dances well.', ['and', 'but'], 0]
    ].map(([id, prompt, options, correctAnswer]) => createMultipleChoiceQuestion(id, prompt, options, correctAnswer));

    const modalsQuestions = [
        [1, 'You _____ finish your homework before playing.', ['must', 'can'], 0],
        [2, '_____ I borrow your pencil, please?', ['May', 'Will'], 0],
        [3, 'She _____ run very fast when she was young.', ['could', 'would'], 0],
        [4, "We _____ go to the park if it doesn't rain.", ['might', 'must'], 0],
        [5, 'You _____ eat healthy food every day.', ['should', 'can'], 0],
        [6, '_____ you help me with this bag?', ['Will', 'May'], 0],
        [7, 'He _____ come to the party tomorrow.', ['might', 'shall'], 0],
        [8, 'Students _____ not talk during the exam.', ['must', 'would'], 0],
        [9, 'I _____ swim across the river easily.', ['can', 'should'], 0],
        [10, '_____ we start the game now?', ['Shall', 'Must'], 0],
        [11, 'You _____ wear a helmet while riding.', ['ought to', 'can'], 0],
        [12, 'It _____ rain later this evening.', ['may', 'will'], 0],
        [13, 'She _____ dance better than anyone else.', ['could', 'would'], 0],
        [14, "_____ I open the window? It's hot here.", ['May', 'Shall'], 0],
        [15, 'Children _____ play outside after school.', ['should', 'must'], 0],
        [16, 'He _____ finish the work by evening.', ['will', 'might'], 0],
        [17, 'You _____ not touch that wire.', ['must', 'may'], 0],
        [18, '_____ you pass the salt, please?', ['Will', 'Can'], 0],
        [19, 'They _____ visit us next weekend.', ['might', 'should'], 0],
        [20, 'We _____ respect our elders always.', ['must', 'could'], 0],
        [21, 'I _____ speak French fluently now.', ['can', 'shall'], 0],
        [22, '_____ you like some tea?', ['Would', 'Must'], 0],
        [23, 'He _____ be at home by now.', ['should', 'can'], 0],
        [24, 'You _____ take medicine twice a day.', ['must', 'may'], 0],
        [25, '_____ I help you carry these books?', ['Shall', 'Will'], 0]
    ].map(([id, prompt, options, correctAnswer]) => createMultipleChoiceQuestion(id, prompt, options, correctAnswer));

    const determinersQuestions = [
        [1, 'I have _____ apple for lunch.', ['a', 'an'], 1],
        [2, '_____ books on the table are mine.', ['This', 'These'], 1],
        [3, "She doesn't have _____ money left.", ['some', 'any'], 1],
        [4, '_____ student must submit the homework.', ['Every', 'Each'], 0],
        [5, 'We need _____ sugar for the tea.', ['a little', 'few'], 0],
        [6, '_____ dog barked at us yesterday.', ['That', 'Those'], 0],
        [7, 'There are _____ mangoes in the basket.', ['much', 'many'], 1],
        [8, '_____ child in the class is happy.', ['Every', 'All'], 0],
        [9, 'I saw _____ elephant at the zoo.', ['a', 'an'], 1],
        [10, '_____ friends came to the party.', ['Few', 'A few'], 1],
        [11, '_____ pen is yours?', ['Which', 'What'], 0],
        [12, 'She has _____ rice for dinner.', ['much', 'many'], 0],
        [13, '_____ house is the biggest.', ['This', 'These'], 0],
        [14, 'We bought _____ flowers for mom.', ['some', 'any'], 0],
        [15, '_____ water is in the bottle.', ['A little', 'Little'], 0],
        [16, '_____ girl won the prize.', ['That', 'Those'], 0],
        [17, 'He ate _____ bread yesterday.', ['a few', 'a little'], 1],
        [18, '_____ people attended the meeting.', ['Many', 'Much'], 0],
        [19, '_____ bicycle is new.', ['My', 'Mine'], 0],
        [20, "There isn't _____ milk left.", ['some', 'any'], 1],
        [21, '_____ day is sunny today.', ['This', 'These'], 0],
        [22, 'She needs _____ help from us.', ['a few', 'some'], 1],
        [23, '_____ chairs are broken.', ['Those', 'That'], 0],
        [24, 'I have _____ homework to do.', ['much', 'many'], 0],
        [25, '_____ member voted yes.', ['Each', 'Every'], 0]
    ].map(([id, prompt, options, correctAnswer]) => createMultipleChoiceQuestion(id, prompt, options, correctAnswer));

    return {
        subject_verb_agreement_1: createTestSeriesSet({
            id: 'subject_verb_agreement_1',
            order: 2,
            title: 'Subject-Verb Agreement - Exercise 1',
            navTitle: 'Subject-Verb Agreement',
            subtitle: 'Fill in the blanks',
            selectorDescription: '25 questions on basic agreement rules',
            contextLabel: 'Subject-Verb Agreement',
            questions: subjectVerbAgreement1Questions
        }),
        subject_verb_agreement_2: createTestSeriesSet({
            id: 'subject_verb_agreement_2',
            order: 3,
            title: 'Subject-Verb Agreement - Exercise 2',
            navTitle: 'Subject-Verb Agreement',
            subtitle: 'Longer and trickier agreement questions',
            selectorDescription: '25 advanced agreement questions',
            contextLabel: 'Subject-Verb Agreement',
            questions: subjectVerbAgreement2Questions
        }),
        mix_tenses_1: createTestSeriesSet({
            id: 'mix_tenses_1',
            order: 4,
            title: 'Mix Tenses',
            navTitle: 'Mix Tenses',
            subtitle: 'Positive, negative, and interrogative sentences',
            selectorDescription: '25 questions across mixed tenses',
            contextLabel: 'Mix Tenses',
            sections: [
                { name: 'Positive Sentences', questions: [1, 2, 3, 4, 5, 6, 7, 8], totalMarks: 8 },
                { name: 'Negative Sentences', questions: [9, 10, 11, 12, 13, 14, 15, 16], totalMarks: 8 },
                { name: 'Interrogative Sentences', questions: [17, 18, 19, 20, 21, 22, 23, 24, 25], totalMarks: 9 }
            ],
            questions: mixTensesQuestions
        }),
        pronouns_1: createTestSeriesSet({
            id: 'pronouns_1',
            order: 5,
            title: 'Pronouns',
            navTitle: 'Pronouns',
            subtitle: 'Choose the correct pronoun',
            selectorDescription: '25 questions on pronouns',
            contextLabel: 'Pronouns',
            questions: pronounsQuestions
        }),
        adjectives_and_adverbs_1: createTestSeriesSet({
            id: 'adjectives_and_adverbs_1',
            order: 6,
            title: 'Adjectives and Adverbs',
            navTitle: 'Adjectives and Adverbs',
            subtitle: 'Choose the correct form',
            selectorDescription: '25 questions on adjectives and adverbs',
            contextLabel: 'Adjectives and Adverbs',
            questions: adjectivesAndAdverbsQuestions
        }),
        prepositions_1: createTestSeriesSet({
            id: 'prepositions_1',
            order: 7,
            title: 'Prepositions',
            navTitle: 'Prepositions',
            subtitle: 'Choose the correct preposition',
            selectorDescription: '25 preposition practice questions',
            contextLabel: 'Prepositions',
            questions: prepositionQuestions
        }),
        conjunctions_1: createTestSeriesSet({
            id: 'conjunctions_1',
            order: 8,
            title: 'Conjunctions',
            navTitle: 'Conjunctions',
            subtitle: 'Connect the ideas correctly',
            selectorDescription: '25 conjunction practice questions',
            contextLabel: 'Conjunctions',
            questions: conjunctionQuestions
        }),
        modals_1: createTestSeriesSet({
            id: 'modals_1',
            order: 9,
            title: 'Modals',
            navTitle: 'Modals',
            subtitle: 'Choose the correct modal verb',
            selectorDescription: '25 modal verb questions',
            contextLabel: 'Modals',
            questions: modalsQuestions
        }),
        determiners_1: createTestSeriesSet({
            id: 'determiners_1',
            order: 10,
            title: 'Determiners',
            navTitle: 'Determiners',
            subtitle: 'Articles, demonstratives, and quantifiers',
            selectorDescription: '25 determiner practice questions',
            contextLabel: 'Determiners',
            questions: determinersQuestions
        })
    };
}
