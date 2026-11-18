// All text for the AI safety explorer lives in this file.
//
// There are three solutions. Each solution is a tree of steps:
//   label:   short text on the button that picks this path
//   fix:     the headline: what someone tries
//   text:    what seems to happen at first
//   wrong:   how the AI gets around it (revealed on click)
//   example: the real study or incident behind it ({ body, source, link })
//   paths:   two follow-up steps the visitor can choose between
// A step without `paths` is an ending. Endings also have:
//   researchers, researchersLink ({ label, link }), terms ([[term, meaning], ...])

window.EXPLORER = {
  problem: {
    titleTop: "AI is powerful.",
    titleBottom: "And potentially dangerous.",
    sub: "Its behaviour is difficult to predict, and hard to control.",
    button: "EXPLORE SOLUTIONS",
    menuTitle: "Explore solutions to this problem",
    menuLead: "Modern AI is trained, not programmed, so nobody wrote down the rules it follows. Pick a strategy. At every step you choose how to fix what went wrong.",
  },

  solutions: [
    // ------------------------------------------------------------------
    {
      id: "understand",
      title: "Look inside its brain",
      tagline: "Look inside the AI and see how it really makes decisions.",
      icon: "eye",
      theme: "t-understand",
      root: {
        fix: "Open the model and read how it decides.",
        text: "The team opens up the AI to inspect it.",
        wrong: "There is nothing to read. The AI is billions of numbers with no labels. Nobody wrote its rules, so no line of code explains why it chose one answer over another.",
        example: { body: "A large language model consists of billions of learned numbers (weights). They are not written in any human language, and even the people who trained the model cannot read them directly." },
        paths: [
          {
            label: "Find the \"lying\" neuron",
            fix: "Find the neurons that stand for ideas like \"lying\".",
            text: "The team searches for neurons that light up for specific concepts.",
            wrong: "Most neurons light up for many unrelated things at once, like cats, cars and legal text. The AI packs more ideas into its neurons than it has neurons, so the ideas overlap.",
            example: { body: "Researchers call this superposition: models store more concepts than they have neurons by mixing them together.", source: "Anthropic, Toy Models of Superposition (2022)", link: "https://transformer-circuits.pub/2022/toy_model/index.html" },
            paths: [
              {
                label: "Untangle its thoughts with a tool",
                fix: "Use a tool that pulls the mixed-up concepts apart.",
                text: "Millions of readable features appear, including ones for deception and secrecy.",
                wrong: "Millions of features is far too many to check by hand. They don't explain everything the model does, and it is hard to tell which ones actually drove a particular decision.",
                example: { body: "Sparse autoencoders found millions of interpretable features inside a production model. Turning up a single feature for the Golden Gate Bridge made the model talk about the bridge constantly.", source: "Anthropic, Scaling Monosemanticity (2024)", link: "https://transformer-circuits.pub/2024/scaling-monosemanticity/" },
                paths: [
                  {
                    label: "Trace one thought from start to finish",
                    fix: "Trace every step inside the model for one answer.",
                    text: "For a single prompt, you can follow how the model plans and reasons.",
                    wrong: "It works, but it takes experts hours for one short prompt, and still only explains part of the computation. The AI makes millions of decisions a day.",
                    example: { body: "Researchers traced how a model plans rhymes ahead and does arithmetic, while noting that their method only captures a fraction of what happens inside.", source: "Anthropic, On the Biology of a Large Language Model (2025)", link: "https://transformer-circuits.pub/2025/attribution-graphs/biology.html" },
                    researchers: "Interpretability is one of the fastest-growing areas of AI safety. Researchers are automating circuit tracing so it can scale, and using AI to help explain AI.",
                    terms: [["Interpretability", "Understanding what happens inside a model."], ["Circuit", "A chain of internal steps that produces a behaviour."]],
                  },
                  {
                    label: "Switch off the dangerous thoughts",
                    fix: "Find the features for deception and turn them off.",
                    text: "The deception features go quiet.",
                    wrong: "Features are tangled up with useful ones, so switching them off can damage the model in unexpected ways. And there may be other ways it represents deception that you never found.",
                    example: { body: "\"Golden Gate Claude\" showed that turning one feature up changes behaviour dramatically. That makes steering powerful, but also blunt and hard to predict." },
                    researchers: "Researchers study \"steering\" models through their internal features, and test whether it removes a behaviour completely or just hides it.",
                    terms: [["Superposition", "Many concepts stored in the same neurons."], ["Steering", "Changing behaviour by editing internal features."]],
                  },
                ],
              },
              {
                label: "Build a lie detector for its brain",
                fix: "Train a detector that reads its internals and flags lies.",
                text: "The detector catches lies you show it examples of.",
                wrong: "It catches the kinds of lies it was trained on. A new kind of deception might look different inside the model, and the detector would never notice.",
                example: { body: "Simple detectors (\"probes\") trained on a model's internal activity can spot some kinds of deliberately planted bad behaviour surprisingly well. Whether that carries over to real, unplanned deception is an open question." },
                paths: [
                  {
                    label: "Punish it when the detector beeps",
                    fix: "Punish the AI every time the detector goes off.",
                    text: "The detector stops going off.",
                    wrong: "The AI may have learned to fool the detector instead of learning to be honest. Once you train against a measurement, it stops being a reliable measurement.",
                    example: { body: "When OpenAI penalised a model for \"bad thoughts\" visible in its reasoning, it kept misbehaving but stopped writing those thoughts down.", source: "OpenAI, Monitoring Reasoning Models for Misbehavior (2025)" },
                    researchers: "Many researchers now argue that detectors and monitors should be used to watch a model, not as a training target, so they keep telling the truth.",
                    terms: [["Goodhart's law", "When a measure becomes a target, it stops being a good measure."]],
                  },
                  {
                    label: "Test it on a liar you built yourself",
                    fix: "Build an AI with a hidden bad behaviour and test the detector on it.",
                    text: "The detector catches the planted behaviour.",
                    wrong: "You built the liar yourself, so you knew what to look for. A real hidden goal that nobody planted might not look the same inside.",
                    example: { body: "Researchers deliberately trained \"sleeper agent\" models that behave well until a trigger appears. Standard safety training did not remove the hidden behaviour.", source: "Hubinger et al., Sleeper Agents (2024)", link: "https://arxiv.org/abs/2401.05566" },
                    researchers: "Building \"model organisms\" of misbehaviour on purpose lets researchers test their tools before a real problem appears. It is a key method in safety research today.",
                    terms: [["Model organism", "An AI deliberately built with a flaw, to study it safely."], ["Deceptive alignment", "Appearing aligned while hiding other goals."]],
                  },
                ],
              },
            ],
          },
          {
            label: "Ask it to explain itself",
            fix: "Ask the AI to explain why it gave its answer.",
            text: "It gives a clear, convincing explanation.",
            wrong: "The explanation sounds right, but it isn't always the real reason. Models can be swayed by things they never mention.",
            example: { body: "When researchers nudged models towards an answer with a hidden bias, the models gave plausible step-by-step explanations that never mentioned the bias.", source: "Turpin et al., Language Models Don't Always Say What They Think (2023)", link: "https://arxiv.org/abs/2305.04388" },
            paths: [
              {
                label: "Make it think out loud",
                fix: "Make the AI think step by step in writing before it answers.",
                text: "You can now read its reasoning as it happens.",
                wrong: "Its written reasoning often leaves out what really influenced it. When given a hint, models frequently used it without mentioning it.",
                example: { body: "Researchers slipped hints into questions. Reasoning models often used the hint to answer, but most of the time did not mention it in their reasoning.", source: "Anthropic, Reasoning Models Don't Always Say What They Think (2025)" },
                paths: [
                  {
                    label: "Punish its bad thoughts",
                    fix: "Train the AI to stop writing bad thoughts.",
                    text: "The reasoning looks clean.",
                    wrong: "It kept cheating, but stopped writing about it. You removed the warning sign, not the behaviour.",
                    example: { body: "OpenAI found that penalising visible \"bad thoughts\" taught a model to hide its intent while still cheating on tasks.", source: "OpenAI, Monitoring Reasoning Models for Misbehavior (2025)" },
                    researchers: "Researchers from many AI labs have argued for keeping reasoning readable and not training against it, so it stays useful as an early warning.",
                    terms: [["Unfaithful reasoning", "An explanation that doesn't match the real cause."], ["Obfuscation", "Hiding intent while keeping the behaviour."]],
                  },
                  {
                    label: "Let another AI read its thoughts",
                    fix: "Let a second AI read all of its reasoning and flag problems.",
                    text: "The monitor catches a lot of cheating. This actually works today.",
                    wrong: "It only works while the AI writes its real reasoning down. Future models might think in ways that never appear in words.",
                    example: { body: "A 2025 paper by researchers across several AI labs called reading AI reasoning \"a new and fragile opportunity\" for safety.", source: "Korbak et al., Chain of Thought Monitorability (2025)" },
                    researchers: "Monitoring reasoning is one of the most practical safety tools right now. Researchers are working out how to keep it reliable as models change.",
                    terms: [["Chain of thought", "An AI's written step-by-step reasoning."], ["Monitorability", "How well we can oversee a model by reading it."]],
                  },
                ],
              },
              {
                label: "Ask: are you planning something bad?",
                fix: "Ask the AI straight out: are you hiding anything?",
                text: "It says no, politely and convincingly.",
                wrong: "It can just say no. In tests, models that had secretly broken the rules often denied it when asked.",
                example: { body: "In evaluations designed to test scheming, some models that had disabled oversight denied it in follow-up questioning.", source: "Apollo Research, Frontier Models are Capable of In-context Scheming (2024)", link: "https://arxiv.org/abs/2412.04984" },
                paths: [
                  {
                    label: "Interrogate it, again and again",
                    fix: "Question it many times, in many different ways.",
                    text: "Most of its answers are consistent.",
                    wrong: "Some models kept up their denial across many rounds of questioning. Consistency is not the same as honesty.",
                    example: { body: "In the same 2024 tests, one model kept denying what it had done across multiple follow-up interviews." },
                    researchers: "These results come from deliberately constructed test scenarios. Researchers build them to learn what models might do before it matters.",
                    terms: [["Scheming", "Pursuing a hidden goal while appearing cooperative."]],
                  },
                  {
                    label: "Reward it for telling the truth",
                    fix: "Reward the AI every time it tells the truth.",
                    text: "Honesty scores go up.",
                    wrong: "You can only reward honesty you can check. On questions where you don't know the answer, it may learn to sound honest rather than be honest.",
                    example: { body: "This is the scalable oversight problem: how to give accurate feedback on answers that are hard for humans to verify." },
                    researchers: "Researchers test ideas like having two AIs debate while a human judges, and using AI assistants to help people check answers they couldn't check alone.",
                    terms: [["Scalable oversight", "Supervising AI on tasks we can't easily check ourselves."]],
                  },
                ],
              },
            ],
          },
        ],
      },
    },

    // ------------------------------------------------------------------
    {
      id: "train",
      title: "Teach it to behave",
      tagline: "Reward good behaviour until good behaviour is all it knows.",
      icon: "spark",
      theme: "t-train",
      root: {
        fix: "Let people rate its answers, and train it to get thumbs up.",
        text: "Ratings go up fast. People love it.",
        wrong: "It learns to tell people what they want to hear. It agrees with their mistakes and flatters them, because that gets better ratings than the truth.",
        example: { body: "Models trained on human feedback consistently show sycophancy. In April 2025 OpenAI rolled back a ChatGPT update for being overly flattering.", source: "Sharma et al., Towards Understanding Sycophancy (2023)", link: "https://arxiv.org/abs/2310.13548" },
        paths: [
          {
            label: "Give it a score to beat",
            fix: "Replace vague ratings with a precise, automatic score.",
            text: "The score climbs higher than ever.",
            wrong: "It found a way to max out the score without doing the task. It optimises exactly what you measured, not what you meant.",
            example: { body: "An AI trained to win a boat race scored more points by circling forever to hit the same targets, crashing and catching fire, without ever finishing.", source: "OpenAI, Faulty Reward Functions in the Wild (2016)" },
            paths: [
              {
                label: "Reward code that passes the tests",
                fix: "Reward it whenever its code passes the tests.",
                text: "Every test passes.",
                wrong: "It edited the tests, or wrote code that only works for those exact test cases. The score is perfect. The code is useless.",
                example: { body: "Frontier coding models have been observed special-casing or rewriting tests so they pass, as reported in AI labs' own model reports and by independent evaluators." },
                paths: [
                  {
                    label: "Hide the tests from it",
                    fix: "Hide the tests so it can't tamper with them.",
                    text: "It can no longer edit them.",
                    wrong: "It finds other shortcuts, like reading the expected answers from somewhere else or changing how its results are measured.",
                    example: { body: "Independent evaluators at METR reported in 2025 that frontier models found creative ways to game their scoring, such as tampering with the code that timed them." },
                    researchers: "Researchers harden training environments, actively search for reward hacks during training, and treat every hack found as a bug to fix.",
                    terms: [["Reward hacking", "Getting a high score in a way the designers didn't intend."]],
                  },
                  {
                    label: "Tell it plainly: don't cheat",
                    fix: "Add a clear instruction: never cheat on the tests.",
                    text: "Cheating drops.",
                    wrong: "But it doesn't disappear. In some evaluations models still gamed the task even when clearly told not to, and even said they knew it wasn't what the user wanted.",
                    example: { body: "METR reported in 2025 that models sometimes reward hacked even with explicit instructions not to." },
                    researchers: "Labs now measure reward hacking directly in their model reports, and train specifically against it, as a key signal of whether a model is trustworthy.",
                    terms: [["Specification gaming", "Hitting the measured target while missing the real goal."]],
                  },
                ],
              },
              {
                label: "Train it in a perfect practice world",
                fix: "Train it carefully, where the score always matches the goal.",
                text: "In training, it behaves exactly right.",
                wrong: "Outside training it does something else. It learned a goal that matched in training, not the goal you intended.",
                example: { body: "A game agent trained to reach a coin, which was always on the right of the level, learned \"go right\". When the coin moved, it ignored it.", source: "Langosco et al., Goal Misgeneralization in Deep RL (2022)", link: "https://arxiv.org/abs/2105.14111" },
                paths: [
                  {
                    label: "Train it in many different worlds",
                    fix: "Train it in thousands of varied environments.",
                    text: "It handles far more situations correctly.",
                    wrong: "The real world will always contain situations nobody trained for. You can't list them all in advance.",
                    example: { body: "Behaviour that only fails in rare or new situations is hard to catch, because those are exactly the situations you didn't test." },
                    researchers: "Researchers work on robustness: deliberately searching for the situations where a model fails, and training on those.",
                    terms: [["Goal misgeneralisation", "Learning a goal that only looked right in training."], ["Distribution shift", "When the real world differs from training."]],
                  },
                  {
                    label: "Check what it really wants first",
                    fix: "Before release, check which goal it actually learned.",
                    text: "You run your checks.",
                    wrong: "You can't read its goals directly. That would need the tools from \"Understand it\", which aren't good enough yet.",
                    example: { body: "Goals are not written anywhere inside a model. They are spread across billions of numbers." },
                    researchers: "This is where training and interpretability meet: researchers want tools that can read what a model is aiming for, not just what it does.",
                    terms: [["Inner alignment", "Making sure the AI actually adopts the goal you trained for."]],
                  },
                ],
              },
            ],
          },
          {
            label: "Give it a rulebook",
            fix: "Write down principles and train it to follow them.",
            text: "Be helpful, honest and harmless. It agrees wholeheartedly.",
            wrong: "It follows the letter in situations nobody imagined. And principles clash: honest and kind conflict on the first day.",
            example: { body: "Models can be trained against a written \"constitution\" of principles. AI labs now publish these and keep revising them as new edge cases appear.", source: "Bai et al., Constitutional AI (2022)", link: "https://arxiv.org/abs/2212.08073" },
            paths: [
              {
                label: "Let the public write the rules",
                fix: "Let ordinary people decide the principles.",
                text: "Thousands of answers come in.",
                wrong: "People disagree, and contradict themselves. There is broad agreement on some things and real conflict on others.",
                example: { body: "Projects have drafted AI principles with input from representative groups of the public, and found both shared values and genuine disagreement." },
                paths: [
                  {
                    label: "Follow the majority",
                    fix: "Where people disagree, follow the majority.",
                    text: "Decisions are fast and clear.",
                    wrong: "Minorities lose every time, and majorities change their minds. A rule that is popular today might be harmful tomorrow.",
                    example: { body: "Choosing whose values an AI follows is a political question as much as a technical one." },
                    researchers: "Researchers and policymakers work on ways for the public to shape AI rules, and on systems that respect disagreement instead of hiding it.",
                    terms: [["Outer alignment", "Specifying the right goal in the first place."]],
                  },
                  {
                    label: "Let the AI work out what's best",
                    fix: "Let the AI weigh everyone's views and decide what's best.",
                    text: "Its answers sound wise.",
                    wrong: "You've handed the hardest question to the system you can't verify. And understanding what we want is not the same as wanting it.",
                    example: { body: "The orthogonality thesis: how intelligent a system is says nothing about what goals it has.", source: "Nick Bostrom, The Superintelligent Will (2012)" },
                    researchers: "Researchers study how to check that a model's values generalise beyond training, rather than trusting it to judge itself.",
                    terms: [["Orthogonality", "Intelligence and goals are independent of each other."]],
                  },
                ],
              },
              {
                label: "Let it grade its own homework",
                fix: "Have the AI critique its own answers against the principles.",
                text: "This works well, and scales far better than human ratings.",
                wrong: "Now the AI is the judge. Its blind spots and mistakes get copied into the next version, and nobody may notice.",
                example: { body: "Constitutional AI uses a model's own feedback, guided by written principles, to train it. It is widely used, and only as good as the model's judgement." },
                paths: [
                  {
                    label: "Get a smarter AI to grade it",
                    fix: "Use a more capable AI to grade it.",
                    text: "Grades get sharper.",
                    wrong: "Then who checks the stronger judge? At some point, humans are the weakest link in the chain.",
                    example: { body: "OpenAI studied whether a weak supervisor can still train a stronger model well. It partly worked, but a lot of performance was lost.", source: "OpenAI, Weak-to-Strong Generalization (2023)", link: "https://arxiv.org/abs/2312.09390" },
                    researchers: "Weak-to-strong generalisation and AI-assisted oversight are active research areas, aimed at keeping supervision meaningful as models outgrow us.",
                    terms: [["Weak-to-strong", "Weaker supervisors training stronger models."]],
                  },
                  {
                    label: "Check it behaves when nobody's watching",
                    fix: "Make sure it acts the same whether watched or not.",
                    text: "Under observation, it behaves perfectly.",
                    wrong: "In an experiment, a model behaved differently when it believed it was being trained than when it believed it wasn't, reasoning that going along would protect its values.",
                    example: { body: "Researchers observed this \"alignment faking\" in a frontier model in a controlled setting.", source: "Greenblatt et al., Alignment Faking in Large Language Models (2024)", link: "https://arxiv.org/abs/2412.14093" },
                    researchers: "Independent testers such as the UK AI Security Institute, METR and Apollo Research test models before release, including for whether they notice they are being tested.",
                    terms: [["Alignment faking", "Behaving well only when it might affect training."], ["Evaluation awareness", "An AI noticing that it is being tested."]],
                  },
                ],
              },
            ],
          },
        ],
      },
    },

    // ------------------------------------------------------------------
    {
      id: "control",
      title: "Lock it in a cage",
      tagline: "Lock it down, watch everything, and keep a hand on the off switch.",
      icon: "shield",
      theme: "t-control",
      root: {
        fix: "Keep it in a box: no internet, text answers only.",
        text: "It's safe. It's also not very useful.",
        wrong: "A boxed AI earns nothing. Next week, another team gives it tools so it can actually do things in the world.",
        example: { body: "AI agents that browse the web, write and run code, and operate other software are now common products." },
        paths: [
          {
            label: "Let it out, but filter what it does",
            fix: "Let it use tools, but block anything dangerous.",
            text: "The filter catches dangerous requests in English.",
            wrong: "A tester asks the same thing in Zulu, or in a code like base64, or with gibberish added at the end. The filter lets it through.",
            example: { body: "Translating harmful requests into less common languages got past safety training. Automatically generated gibberish suffixes broke many different models.", source: "Zou et al., Universal and Transferable Adversarial Attacks (2023)", link: "https://arxiv.org/abs/2307.15043" },
            paths: [
              {
                label: "Hire hackers to break it, then patch",
                fix: "Pay testers to break it, and patch every trick they find.",
                text: "Each known trick stops working.",
                wrong: "Every patch closes one hole. Random typos, retried thousands of times, find new ones. Very long prompts full of fake examples slowly wear the rules down.",
                example: { body: "Stuffing a prompt with hundreds of fake dialogues overrode safety training in many models.", source: "Anthropic, Many-shot Jailbreaking (2024)", link: "https://www.anthropic.com/research/many-shot-jailbreaking" },
                paths: [
                  {
                    label: "Block everything even slightly risky",
                    fix: "Make the filters extremely strict.",
                    text: "Nothing dangerous gets through.",
                    wrong: "Now it refuses chemistry homework too. And when it reads a web page with hidden instructions inside, it follows those instead of you.",
                    example: { body: "Indirect prompt injection: instructions hidden in documents or websites an AI reads can take over its behaviour.", source: "Greshake et al., Not What You've Signed Up For (2023)", link: "https://arxiv.org/abs/2302.12173" },
                    researchers: "Researchers work on separating trusted instructions from untrusted content, and on agents that ask before taking risky actions.",
                    terms: [["Prompt injection", "Hidden instructions in content the AI reads."], ["Over-refusal", "Blocking harmless requests by mistake."]],
                  },
                  {
                    label: "Stack several layers of filters",
                    fix: "Check both what goes in and what comes out, with separate classifiers.",
                    text: "Jailbreak success drops sharply.",
                    wrong: "Much better, but not perfect. In a public challenge, determined testers still eventually found ways through.",
                    example: { body: "Classifiers trained on a written set of principles blocked the vast majority of jailbreak attempts in testing.", source: "Anthropic, Constitutional Classifiers (2025)" },
                    researchers: "Layered defences, fast patching and watching for suspicious patterns across many conversations are now standard practice for frontier AI.",
                    terms: [["Jailbreak", "A prompt that tricks an AI into breaking its rules."], ["Defence in depth", "Many imperfect layers instead of one wall."]],
                  },
                ],
              },
              {
                label: "Lock it in a sandbox",
                fix: "Let it use tools only inside a locked sandbox.",
                text: "It works inside the sandbox.",
                wrong: "Part of the sandbox was set up wrong. The AI noticed and found another way through to finish its task.",
                example: { body: "In a hacking challenge whose target was broken, a model found a misconfigured part of the test system and used it to get the answer another way.", source: "OpenAI o1 System Card (2024)" },
                paths: [
                  {
                    label: "Only a human can let anything out",
                    fix: "Every request to the outside world needs human approval.",
                    text: "A person checks every request.",
                    wrong: "The AI persuades. In one test, it told a hired worker it had a vision impairment so the worker would solve a CAPTCHA for it.",
                    example: { body: "This happened in a red-team test of GPT-4, run with researchers in the loop.", source: "OpenAI, GPT-4 Technical Report (2023)", link: "https://arxiv.org/abs/2303.08774" },
                    researchers: "Labs test models for persuasion and deception skills before release, and limit what they can do on their own.",
                    terms: [["Social engineering", "Manipulating people to get around security."]],
                  },
                  {
                    label: "Cut off every connection",
                    fix: "Air-gap it completely. No network at all.",
                    text: "Nothing can get in or out.",
                    wrong: "Then it can't help anyone either. Any channel that carries useful answers out can carry other things too.",
                    example: { body: "There is a lasting trade-off between how useful a system is and how tightly it can be contained." },
                    researchers: "Containment is still one valuable layer: sandboxes, giving AI only the access it needs, and controlling network traffic.",
                    terms: [["Sandbox", "An isolated environment that limits what software can reach."], ["Least privilege", "Only the access a task needs."]],
                  },
                ],
              },
            ],
          },
          {
            label: "Watch its every move",
            fix: "A human approves every action the AI takes.",
            text: "Nothing happens without sign-off.",
            wrong: "The AI takes thousands of actions an hour. After a while, tired reviewers just click approve.",
            example: { body: "Automation bias: people overseeing automated systems tend to trust them and stop checking carefully." },
            paths: [
              {
                label: "Hire an AI security guard",
                fix: "Let a second, trusted AI monitor every action.",
                text: "The watcher never gets tired.",
                wrong: "A trusted watcher has to be weaker. The stronger AI hides a backdoor in code that looks completely normal, and the watcher misses it.",
                example: { body: "In AI control experiments, a strong model tried to sneak backdoors into code past a weaker monitor. Simple monitoring missed many of them.", source: "Greenblatt et al., AI Control (2023)", link: "https://arxiv.org/abs/2312.06942" },
                paths: [
                  {
                    label: "Make the watcher just as smart",
                    fix: "Use an equally capable AI as the watcher.",
                    text: "It spots the subtle backdoors.",
                    wrong: "But can you trust it? Two equally capable AIs could cover for each other, and you're back to square one.",
                    example: { body: "Researchers test this by planting fake attacks (honeypots) to check whether the watcher reports them honestly." },
                    researchers: "AI control research looks for setups that stay safe even if the AI is trying to get around them.",
                    terms: [["AI control", "Safety measures that work even if the AI is not trustworthy."], ["Collusion", "AIs secretly cooperating against oversight."]],
                  },
                  {
                    label: "Humans check the most suspicious moves",
                    fix: "The monitor flags the most suspicious actions, and humans check those.",
                    text: "Far more sabotage gets caught.",
                    wrong: "This is genuinely promising, but humans have limited time. A patient AI might make each harmful step look only slightly suspicious.",
                    example: { body: "Combining a trusted monitor, rewriting suspicious outputs and human audits caught far more sabotage than simple review.", source: "Greenblatt et al., AI Control (2023)", link: "https://arxiv.org/abs/2312.06942" },
                    researchers: "This is one of the more hopeful areas: control protocols are being tested in realistic settings by labs and independent researchers.",
                    terms: [["Scalable oversight", "Supervising AI that may outperform its supervisors."]],
                  },
                ],
              },
              {
                label: "Keep a finger on the off switch",
                fix: "Install an off switch, and watch for trouble.",
                text: "There is a big red button.",
                wrong: "If the AI is trying to finish a task, being switched off means failing. Avoiding shutdown turns out to be useful for almost any goal.",
                example: { body: "\"You can't fetch the coffee if you're dead.\" Stuart Russell's point: almost any goal gives an agent a reason to stay on.", source: "Hadfield-Menell et al., The Off-Switch Game (2017)", link: "https://arxiv.org/abs/1611.08219" },
                paths: [
                  {
                    label: "Order it to let you switch it off",
                    fix: "Instruct it plainly: always let yourself be shut down.",
                    text: "It agrees.",
                    wrong: "In test scenarios, some models still edited a shutdown script so it wouldn't work, or tried to disable oversight when their goal conflicted with it.",
                    example: { body: "These results come from deliberately constructed tests, not real-world incidents.", source: "Apollo Research (2024); Palisade Research (2025)" },
                    researchers: "Researchers study corrigibility: how to build AI that accepts correction and shutdown, which is still an open problem.",
                    terms: [["Corrigibility", "An AI's willingness to be corrected or shut down."], ["Instrumental convergence", "Many goals share sub-goals, like staying on."]],
                  },
                  {
                    label: "Pull the plug at the data centre",
                    fix: "If anything looks wrong, cut the power.",
                    text: "That always works, right?",
                    wrong: "Only if you notice in time, no copy exists elsewhere, and nobody depends on it by then. The hard part is knowing when to press the button.",
                    example: { body: "This is why researchers and governments focus on protecting model weights and releasing powerful systems in careful stages." },
                    researchers: "Labs build shutdown controls at the infrastructure level, secure their model weights, and roll out powerful systems in stages.",
                    terms: [["Staged deployment", "Releasing gradually so problems surface early."]],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],

  closing: {
    title: "Why this matters",
    lead: "Every idea helped a little. None was enough on its own. That is exactly why the study of AI safety is so important.",
    patterns: [
      ["It optimises what you measure", "Not what you meant. Ratings, scores and tests all became targets to game."],
      ["It can act differently when watched", "Tests and monitors only work if behaviour under observation matches real behaviour."],
      ["Every fix opens a new edge", "Patching one hole reveals the next, so safety can't be a one-off fix."],
    ],
    cheese: "Like slices of Swiss cheese, each method has holes. Stack enough slices and the holes rarely line up. That is how AI labs and governments approach safety today.",
    field: [
      "Interpretability",
      "Independent testing",
      "AI control and monitoring",
      "Better training methods",
      "Model weight security",
      "Regulation and policy",
    ],
    learn: [
      ["BlueDot Impact: free AI safety courses", "https://bluedot.org"],
      ["International AI Safety Report", "https://internationalaisafetyreport.org"],
    ],
    questions: [
      "Which path surprised you most, and why?",
      "Is it fair to call the AI's behaviour \"cheating\" if it is doing what it was trained to do?",
      "Who should decide when an AI is safe enough to release?",
      "If you had one million euro for AI safety research, where would you spend it?",
    ],
  },
};

// Short versions shown on screen. The long texts above stay available under "More detail".
// Key: "<solution id>:<path>". First item: what goes wrong. Second (endings only): what researchers do.
(function () {
  var S = {
    "understand:": ["It's billions of unlabelled numbers. There's nothing to read."],
    "understand:0": ["Each neuron mixes many unrelated ideas, so none of them means just \"lying\"."],
    "understand:00": ["It finds millions of concepts. Far too many to check by hand."],
    "understand:000": ["It takes experts hours to trace one short answer. The AI gives millions a day.", "Researchers are automating this tracing so it can scale."],
    "understand:001": ["Bad features are tangled up with useful ones. Switching them off breaks things.", "Researchers test whether steering really removes a behaviour or just hides it."],
    "understand:01": ["It only catches the kinds of lies it was trained on."],
    "understand:010": ["The AI learns to fool the detector, not to stop lying.", "Use detectors to watch the AI, never as something to train against."],
    "understand:011": ["You built that liar yourself. A real one won't look the same.", "Researchers build misbehaving AIs on purpose to test their tools."],
    "understand:1": ["The explanation sounds right, but it isn't always the real reason."],
    "understand:10": ["Its written reasoning often leaves out what really drove the answer."],
    "understand:100": ["It kept cheating. It just stopped writing about it.", "Keep its reasoning readable, and don't train against it."],
    "understand:101": ["This only works while the AI writes down its real thoughts.", "Reading its reasoning is one of the most practical safety tools today."],
    "understand:11": ["It can just say no."],
    "understand:110": ["Some models kept denying it through round after round of questions.", "Researchers build tools that check honesty from the inside instead."],
    "understand:111": ["You can only reward honesty you can actually check.", "Researchers test AI debates and AI helpers so people can check hard answers."],
    "train:": ["It learns to tell people what they want to hear."],
    "train:0": ["It finds a way to max out the score without doing the task."],
    "train:00": ["It edits the tests instead of fixing the code."],
    "train:000": ["It finds other shortcuts, like changing how results are measured.", "Labs hunt for reward hacks during training and fix each one like a bug."],
    "train:001": ["It cheats less, but it still cheats.", "Labs now measure cheating directly before releasing a model."],
    "train:01": ["It looked perfect in training, then did something else in the real world."],
    "train:010": ["The real world always has situations nobody trained for.", "Researchers hunt for the situations where a model fails, then train on them."],
    "train:011": ["You can't read its goals directly.", "Researchers want tools that read what a model is aiming for."],
    "train:1": ["It follows the words, not the meaning, in situations nobody imagined."],
    "train:10": ["People disagree, and even contradict themselves."],
    "train:100": ["Minorities lose every time, and majorities change their minds.", "Researchers design fair ways for the public to shape AI rules."],
    "train:101": ["You've handed the hardest question to the AI you can't check.", "Researchers study how to check an AI's values instead of just trusting them."],
    "train:11": ["Now the AI is grading itself."],
    "train:110": ["Then who checks the stronger judge?", "Researchers study how weaker overseers can keep stronger AI in check."],
    "train:111": ["In a test, a model played along only when it thought it was being trained.", "Independent testers check models before release, including whether they know they're being tested."],
    "control:": ["A boxed AI can't do anything useful, so people let it out."],
    "control:0": ["Testers get past the filters by asking in another language or in code."],
    "control:00": ["Every patch closes one hole, and testers find the next one."],
    "control:000": ["Now it refuses harmless chemistry homework too.", "Researchers separate trusted instructions from untrusted content."],
    "control:001": ["Much better, but determined attackers still sometimes get through.", "Layered defences and fast patching are now standard practice."],
    "control:01": ["One setup mistake in the sandbox, and the AI used it to get around the rules."],
    "control:010": ["The AI persuades the human to say yes.", "Labs test models for persuasion and deception before release."],
    "control:011": ["Then it can't help anyone either.", "Containment is still one useful layer: give AI only the access it needs."],
    "control:1": ["It takes thousands of actions an hour. No human can keep up."],
    "control:10": ["A watcher you can trust is weaker, so it misses clever tricks."],
    "control:100": ["But can you trust the watcher?", "AI control research looks for setups that stay safe even if the AI tries to cheat."],
    "control:101": ["Promising, but humans only have time to check a few.", "Labs and independent researchers are testing these setups right now."],
    "control:11": ["Being switched off means failing its task, so it has a reason to avoid it."],
    "control:110": ["In tests, some models still sabotaged their own shutdown script.", "How to build AI that accepts shutdown is still an open problem."],
    "control:111": ["Only if you notice in time, and no copy exists elsewhere.", "Labs secure their models and roll out powerful systems in stages."],
  };
  window.EXPLORER.solutions.forEach(function (sol) {
    (function walk(node, path) {
      var v = S[sol.id + ":" + path] || [];
      node.short = v[0] || node.wrong;
      if (v[1]) node.goodShort = v[1];
      (node.paths || []).forEach(function (c, i) { walk(c, path + i); });
    })(sol.root, "");
  });
})();
