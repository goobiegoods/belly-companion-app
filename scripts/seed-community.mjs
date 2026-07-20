// One-off script: seeds the Mamas community with real, persisted Supabase data
// (real auth.users accounts authoring real posts/comments) instead of the old
// display-only src/data/seededPosts.ts mock. Safe to re-run — see idempotency
// notes below. Run with: node scripts/seed-community.mjs
//
// Every persona account is tagged two independent ways so it can be found and
// bulk-deleted later without touching real users:
//   1. email matches `seed+<slug>@belly.app`
//   2. auth user_metadata.seed_account === true
// The official "Belly" host account intentionally does NOT match either marker
// (email hello@belly.app, no seed_account flag) so cleanup never removes it.
//
// Cleanup query (Supabase SQL editor), once you're done with these personas:
//   delete from auth.users where email like 'seed+%@belly.app';
// ON DELETE CASCADE on profiles/posts/comments/post_likes removes everything
// they authored automatically.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const text = readFileSync(path.join(__dirname, "..", ".env"), "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*"?([^"\n\r]*)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const SEED_PASSWORD = "BellySeed!2026Community";
const readClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PERSONAS = [
  "maya", "priya", "chloe", "layla", "noor", "zara", "isla", "sofia",
  "amara", "hana", "leila", "wren", "imani", "saoirse", "mireia", "camille", "beatrix",
].map((slug) => ({ slug, name: slug[0].toUpperCase() + slug.slice(1) }));

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

// title, body, category, week_posted, likes, author persona slug, days ago
const POSTS = [
  // ---- Questions ----
  ["Anyone else terrified of the anatomy scan?", "I'm 19 weeks and my anatomy scan is next week. Excited but also scared they'll find something wrong. Is it normal to feel both at once? How did you cope with the wait?", "question", 19, 8, "maya", 11],
  ["How much water is actually enough in T3?", "I drink what feels like a lake and still wake up thirsty. Is there a number you aim for? My ankles are also pretending to be water balloons.", "question", 31, 22, "priya", 2],
  ["Did anyone skip the glucose drink?", "The orange syrup makes me gag just thinking about it. My midwife said I could do the jelly bean test or food alternatives. Curious what worked for you.", "question", 26, 41, "chloe", 4],
  ["Heartburn so bad I'm sleeping sitting up", "Tums every two hours, no spicy food, no late dinners... still on fire. Is there anything else that actually works without meds?", "question", 30, 28, "layla", 1],
  ["How did you tell work you were pregnant?", "I'm 11 weeks and showing earlier than I'd like. Manager is supportive in theory but I'm dreading the conversation. Did you script it?", "question", 11, 24, "noor", 7],
  ["What's actually in your hospital bag?", "I've seen lists with 40 items and lists with 8. What did you genuinely use and what stayed zipped up the whole time?", "question", 36, 71, "zara", 2],
  ["Vivid dreams are out of control", "Last night I dreamt I was a koala doing tax returns. Every night is a movie. Anyone else? Is it the hormones or the multiple pee breaks?", "question", 17, 47, "isla", 3],
  ["Did you write a birth plan or just vibes?", "Part of me wants a one-pager. Part of me thinks the universe laughs at birth plans. What did you do?", "question", 32, 35, "sofia", 5],
  ["Coffee — full stop or one cup okay?", "My midwife says one cup is fine. My MIL gasps every time I make tea. The internet is split. What did you do?", "question", 13, 18, "amara", 14],
  ["Sushi after birth — what's first on your list?", "Need this to keep me going. Mine is a giant cold beer and unpasteurized cheese. What's yours?", "question", 33, 92, "hana", 1],
  ["How do you handle unsolicited belly touching?", "I had a coworker today just... go for it. I was too stunned to say anything. What's your line?", "question", 29, 64, "leila", 2],
  ["Bleeding gums every time I brush", "Anyone else? I floss, I rinse, I'm gentle, and there's still pink in the sink. Is this just T2 hormones?", "question", 21, 12, "wren", 10],
  ["Pediatrician interview questions?", "I have three lined up next week. Beyond vaccines and breastfeeding philosophy, what did you wish you had asked?", "question", 35, 29, "imani", 8],

  // ---- Stories ----
  ["I felt the first kick today and I ugly cried", "Week 18. Sitting at my desk eating lunch and — this tiny flutter. Then again. Nothing prepares you for that moment.", "story", 18, 89, "saoirse", 4],
  ["My home birth was everything I hoped for", "Week 39, midwife arrived at 11pm. Baby was born in our bedroom at 4:17am. The most primal, beautiful, terrifying, empowering thing I have ever done.", "story", 39, 134, "mireia", 7],
  ["Second pregnancy is so different and nobody told me", "With my first I was anxious, reading every app, tracking every symptom. This time I'm 14 weeks and just... living. It's nice and also kind of guilt-inducing.", "story", 14, 41, "camille", 1],
  ["Surprise twins at the 12-week scan", "Went in for a routine scan. Sonographer went quiet. Then: 'so... there's two.' I laughed for ten minutes straight. Now I'm 19 weeks and slowly recovering from the joke the universe played on us.", "story", 19, 178, "beatrix", 3],
  ["Three hour labor with my second — wild", "Water broke at home at 9pm. Baby in my arms by midnight. Midwives almost didn't make it. My partner was googling 'how to catch a baby' on the way to the hospital.", "story", 40, 156, "maya", 5],
  ["Telling my five year old she'll be a big sister", "I'd been dreading the conversation. She put her ear on my belly, was quiet for a long time, then whispered 'hi friend.' I will never recover.", "story", 16, 188, "priya", 2],
  ["First trimester ended and I'm finally a person again", "I genuinely thought I had been replaced by a nauseous, sleeping potato for ten weeks. Today I made breakfast, walked the dog, and did not throw up once. We are healing.", "story", 14, 96, "chloe", 1],
  ["Maternity leave starts tomorrow and I'm a wreck", "37 weeks. Cleaned out my desk today. The people I work with are like family. I cried in the parking lot for fifteen minutes. Also: I'm tired. Time to rest.", "story", 37, 67, "layla", 3],
  ["I finally bought the bassinet and I felt the shift", "26 weeks. I'd been avoiding 'real' baby purchases. Today the bassinet arrived, I set it up next to the bed, and something in me clicked into mother.", "story", 26, 124, "noor", 8],
  ["The midwife handed me my baby and time stopped", "I'd watched a hundred birth videos. None of them captured this. She was warm and wet and screaming and mine. I forgot to ask the sex for twenty minutes.", "story", 40, 256, "zara", 6],
  ["Gender disappointment is real and I'm working through it", "I had built up this whole vision. Found out we're having a boy and I cried — not happy tears. I love him already. I'm just letting myself feel the small grief and then move on.", "story", 20, 112, "isla", 6],
  ["C-section recovery — week one and I'm okay", "I was so scared of the c-section after a long labor that ended with one. Day 7 and I'm walking gently, baby is feeding, scar is healing. I want to tell anyone facing one: you can do this.", "story", 40, 142, "sofia", 8],
  ["Queer pregnancy and the wave of joy I didn't expect", "My wife and I tried for two years. I'm 22 weeks. The first time I felt her move in a meeting I just smiled stupidly into my laptop.", "story", 22, 165, "amara", 4],

  // ---- Tips ----
  ["Nux Vomica 30c literally saved my first trimester", "I was vomiting 4-5 times a day until my naturopath suggested Nux Vomica 30c. Three pellets under the tongue before bed and on waking. Within 3 days the nausea was 60% better.", "tip", 10, 47, "hana", 5],
  ["P6 acupressure point is no joke", "Two finger widths below your wrist between the two tendons. Press firmly for 60 seconds on each wrist. I do this every morning before getting out of bed and it genuinely takes the edge off the nausea.", "tip", 8, 62, "leila", 9],
  ["CCF tea for bloating and digestion", "Cumin, coriander, fennel — equal parts, steep for 10 minutes. My Ayurvedic practitioner recommended this in T2 for the gas and bloating. Gentle and surprisingly tasty.", "tip", 18, 28, "wren", 12],
  ["Magnesium glycinate for sleep is everything", "I was waking 3-4 times a night from leg cramps and restlessness. My midwife suggested magnesium glycinate before bed. Within a week I was sleeping in 5 hour stretches.", "tip", 26, 55, "imani", 2],
  ["Six dates a day from week 36 — yes really", "Studies suggest 6 medjool dates a day in the last weeks can shorten labor and reduce need for induction. I had them with almond butter. Easy, sweet, baby came on time.", "tip", 36, 118, "saoirse", 4],
  ["Perineal massage starting at 34 weeks", "I used a high-quality almond oil and the technique my midwife taught me. 5 minutes, 3-4 times a week. I had a tiny tear instead of an episiotomy. I credit this.", "tip", 34, 84, "mireia", 8],
  ["Pregnancy pillow hack — you don't need the giant one", "I tried the U shape. Got too hot, fell out of bed. Two regular pillows: one between knees, one under bump. Works perfectly and you keep your bed.", "tip", 24, 52, "camille", 3],
  ["Ginger anything, all day, T1", "Crystallized ginger in my bag. Ginger tea on my desk. Ginger chews in the car. Didn't cure nausea but blunted it just enough to function. Find your form.", "tip", 8, 38, "beatrix", 13],
  ["Hospital bag — what I actually used", "Long phone charger, lip balm, snacks for partner, my own pillow with patterned case so it didn't get lost, comfy nursing bra, flip flops for the shower. The rest stayed packed.", "tip", 36, 87, "maya", 2],
  ["Squatting daily after 32 weeks", "I do 10 deep supported squats holding a doorframe in the morning and evening. Opens the pelvis, builds endurance, and I noticed my heartburn calmed too.", "tip", 33, 47, "priya", 8],
  ["Postpartum freezer meals nobody talks about", "Skip the lasagnas. Make small, easy-to-eat-with-one-hand things: oatmeal cups, lactation balls, chicken soup in jars, breakfast burritos. Future you will weep.", "tip", 35, 156, "chloe", 4],
  ["Belly oil routine that actually helped my itching", "Cold-pressed jojoba mixed with a few drops of vitamin E, slathered on after every shower while skin is still damp. The relentless itching at 28 weeks stopped.", "tip", 28, 43, "layla", 14],
  ["Track wins, not symptoms", "I stopped logging every twinge and started writing one good thing daily. 'Walked twice today.' 'Ate a real lunch.' My anxiety dropped within a week.", "tip", 19, 78, "noor", 3],

  // ---- Support (normal) ----
  ["Prenatal anxiety is real and nobody talks about it", "I thought postpartum depression was the thing to worry about. Nobody warned me about the anxiety during pregnancy. I started seeing a perinatal therapist last week and it's already helping.", "support", 22, 94, "zara", 3],
  ["Grieving my pre-pregnancy body and feeling ashamed of that", "I love this baby more than I can say. I also miss feeling like myself in my body. Both things are true. Naming it out loud helped me stop spiraling.", "support", 20, 88, "isla", 8],
  ["Geriatric pregnancy label is doing a number on me", "I'm 36 and apparently 'advanced maternal age.' Every appointment lists a risk. I'm working with a therapist to remember I am also a healthy human with a thriving baby.", "support", 17, 71, "sofia", 11],
  ["Body changes that aren't 'cute bump'", "Spider veins, melasma, hemorrhoids, a belly button that turned itself inside out. Nobody puts this on Instagram. I love my body and I'm also allowed to mourn it changing.", "support", 31, 124, "amara", 4],
  ["My partner is wonderful and I still feel alone in this", "He listens, he reads the books, he's at every appointment. And yet the body doing the work is mine, and at 3am the loneliness is its own thing. Just naming it.", "support", 25, 92, "hana", 12],
  ["Fear of birth is eating my last weeks", "I'm 36 weeks. Every night I lie awake imagining everything that could go wrong. I started a hypnobirthing course this week and downloaded the affirmations. Trying to soften my grip.", "support", 36, 103, "leila", 6],
  ["Family pressure on baby names is wild", "Both grandmothers want their names used. We have a name we love that's neither. I'm rehearsing a calm sentence and trying not to people-please my way out of the name I love.", "support", 29, 67, "wren", 5],
  ["Feeling guilty for not 'enjoying every minute'", "Pregnancy is hard. I love my baby. I also do not love being pregnant. Both can be true and I'm letting go of the guilt about it.", "support", 21, 134, "imani", 2],

  // ---- Support (sensitive — gated in the UI by isSensitiveStory) ----
  ["Scared to tell people because of my history", "I've had two losses. I'm 8 weeks and terrified to feel hopeful. I haven't told anyone except my partner. Just need to say it out loud somewhere safe.", "support", 8, 76, "saoirse", 6],
  ["My mom isn't going to meet her grandchild", "She passed last spring. I'm 24 weeks and the grief comes in waves. Today I wore one of her scarves to my appointment. It felt like she was there.", "support", 24, 198, "mireia", 9],
  ["Hyperemesis is breaking me — week 14", "I've lost 5kg, I'm on Zofran and IV fluids weekly, I can't work. I love this baby and I also feel like I'm failing. If you've been here please tell me it ends.", "support", 14, 142, "camille", 2],
  ["Birth trauma from my first and I'm scared again", "27 weeks with my second. I've started seeing a birth-focused therapist and writing my fears to my new midwife. Just sharing in case anyone else is here too.", "support", 27, 119, "beatrix", 7],
  ["NICU mom — week three and I just need to vent", "She's healthy and growing. I'm grateful. I'm also exhausted from pumping every 3 hours and driving 40 min to the hospital. Sometimes gratitude and grief share a room.", "support", 33, 156, "maya", 1],
];

// post title -> [{ persona slug, reply body }]
const REPLIES = {
  "I felt the first kick today and I ugly cried": [
    ["priya", "This made me tear up reading it. That first flutter is unreal."],
    ["zara", "Yes! I remember exactly where I was standing. Congratulations, mama."],
  ],
  "Did anyone skip the glucose drink?": [
    ["layla", "I did the jelly beans, worked fine for me. Ask your midwife which brand they accept first though."],
    ["hana", "Held my nose and chugged it in one go. Over before I knew it."],
  ],
  "Six dates a day from week 36 — yes really": [
    ["wren", "Doing this now at 37 weeks — any brand recommendation or just any medjool dates?"],
  ],
  "Prenatal anxiety is real and nobody talks about it": [
    ["maya", "Thank you for saying this out loud. I felt so alone in it until now."],
    ["leila", "Started therapy at 20 weeks too, best decision I made this pregnancy."],
    ["camille", "Sending you so much warmth. You're not broken for feeling this."],
  ],
  "The midwife handed me my baby and time stopped": [
    ["isla", "Crying at my desk reading this. What a moment."],
    ["sofia", "This is exactly how I imagine it will feel. Thank you for sharing."],
  ],
  "Sushi after birth — what's first on your list?": [
    ["amara", "A really good burger, extra rare, extra everything."],
    ["noor", "Soft cheese board and a big glass of wine, no shame."],
  ],
  "Scared to tell people because of my history": [
    ["mireia", "Holding hope with you. However this goes, you are not alone."],
    ["beatrix", "I felt exactly this after my loss. Sending you so much care."],
  ],
  "Nux Vomica 30c literally saved my first trimester": [
    ["saoirse", "Ordering this tonight, I'll try anything at this point."],
  ],
  "My partner is wonderful and I still feel alone in this": [
    ["imani", "This is exactly it. Loved and lonely can live in the same body."],
    ["chloe", "So well put. Naming it helped me stop feeling guilty about it."],
  ],
  "Surprise twins at the 12-week scan": [
    ["priya", "The way you told this had me laughing out loud. Congratulations on your two!"],
    ["wren", "'So... there's two' is sending me. Wishing you the easiest rest of pregnancy."],
  ],
};

const HOST_EMAIL = "hello@belly.app";
const HOST_POSTS = [
  ["Welcome to the mama community", "This is a space for real questions, real stories, real tips, and real support — from one mama to the next. Belly's team keeps an eye on things, but the voices here are yours. However far along you are, however you're feeling today, you belong here.", "announcement", null, 12, true, 39],
  ["How this space works", "A few notes on getting the most out of this space: post under Questions, Stories, Tips, or Support depending on what you need. Some posts touch on loss, NICU stays, or birth trauma — those are marked as sensitive and collapsed by default, so you can choose when you're ready to read them. Be kind, be honest, and take what helps.", "announcement", null, 9, true, 40],
  ["What's one small thing that made today easier?", "Could be a snack, a five-minute nap, a text from a friend, anything. Tell us your small win from today.", "question", null, 5, false, 2],
  ["Tell us: what surprised you most about pregnancy?", "Not the textbook stuff — the weird, funny, unexpected moments nobody warned you about. We want to hear them.", "story", null, 4, false, 1],
];

async function signInOrSignUp(email, metadata) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const signIn = await client.auth.signInWithPassword({ email, password: SEED_PASSWORD });
  if (signIn.data?.session) return { client, userId: signIn.data.user.id, created: false };

  const signUp = await client.auth.signUp({
    email,
    password: SEED_PASSWORD,
    options: { data: metadata },
  });
  if (signUp.error) throw new Error(`signUp(${email}) failed: ${signUp.error.message}`);
  if (!signUp.data.session) throw new Error(`signUp(${email}) returned no session — autoconfirm may be off`);
  return { client, userId: signUp.data.user.id, created: true };
}

async function ensureProfile(client, userId, firstName) {
  await client.from("profiles").update({ first_name: firstName }).eq("user_id", userId);
}

async function postExists(title) {
  const { data } = await readClient.from("posts").select("id, display_name").eq("title", title).maybeSingle();
  return data ?? null;
}

async function main() {
  let accountsCreated = 0, accountsReused = 0;
  let postsInserted = 0, postsSkipped = 0;
  let repliesInserted = 0, repliesSkipped = 0;

  const personaClients = {};
  for (const p of PERSONAS) {
    const email = `seed+${p.slug}@belly.app`;
    const { client, userId, created } = await signInOrSignUp(email, { seed_account: true });
    await ensureProfile(client, userId, p.name);
    personaClients[p.slug] = { client, userId };
    created ? accountsCreated++ : accountsReused++;
    console.log(`${created ? "created" : "reused "} persona ${p.name} (${email})`);
  }

  const { client: hostClient, userId: hostUserId, created: hostCreated } =
    await signInOrSignUp(HOST_EMAIL, {});
  await ensureProfile(hostClient, hostUserId, "Belly");
  hostCreated ? accountsCreated++ : accountsReused++;
  console.log(`${hostCreated ? "created" : "reused "} host account Belly (${HOST_EMAIL})`);
  console.log(`\nBELLY_HOST_USER_ID = "${hostUserId}"\n(hardcode this into src/lib/community.ts)\n`);

  for (const [title, body, category, week_posted, likes, personaSlug, days] of POSTS) {
    const persona = PERSONAS.find((p) => p.slug === personaSlug);
    const { client, userId } = personaClients[personaSlug];
    const existing = await postExists(title);
    if (existing) {
      postsSkipped++;
      if (!existing.display_name) {
        await client.from("posts").update({ display_name: persona.name }).eq("id", existing.id);
      }
      continue;
    }

    const { data: inserted, error } = await client
      .from("posts")
      .insert({ user_id: userId, title, body, category, week_posted, likes, display_name: persona.name, created_at: daysAgo(days) })
      .select("id")
      .single();
    if (error) { console.error(`  failed to insert "${title}": ${error.message}`); continue; }
    postsInserted++;

    const replies = REPLIES[title];
    if (replies) {
      for (const [replySlug, replyBody] of replies) {
        const { client: replyClient, userId: replyUserId } = personaClients[replySlug];
        const { error: replyError } = await replyClient
          .from("comments")
          .insert({ post_id: inserted.id, user_id: replyUserId, body: replyBody });
        if (replyError) { console.error(`  failed reply on "${title}": ${replyError.message}`); continue; }
        repliesInserted++;
      }
    }
  }

  for (const [title, body, category, week_posted, likes, pinned, days] of HOST_POSTS) {
    const existing = await postExists(title);
    if (existing) {
      postsSkipped++;
      if (!existing.display_name) {
        await hostClient.from("posts").update({ display_name: "Belly" }).eq("id", existing.id);
      }
      continue;
    }
    const { error } = await hostClient
      .from("posts")
      .insert({ user_id: hostUserId, title, body, category, week_posted, likes, is_pinned: pinned, display_name: "Belly", created_at: daysAgo(days) });
    if (error) { console.error(`  failed to insert host post "${title}": ${error.message}`); continue; }
    postsInserted++;
  }

  // Replies whose parent post was skipped (already existed) never get inserted —
  // REPLIES is only ever consulted right after a fresh insert above, so reruns
  // never duplicate reply rows either. Report what was skipped for visibility.
  const totalReplyRows = Object.values(REPLIES).reduce((n, arr) => n + arr.length, 0);
  repliesSkipped = totalReplyRows - repliesInserted;

  console.log("\n--- Summary ---");
  console.log(`Accounts created: ${accountsCreated}, reused: ${accountsReused}`);
  console.log(`Posts inserted: ${postsInserted}, skipped (already existed): ${postsSkipped}`);
  console.log(`Replies inserted: ${repliesInserted}, skipped (parent already existed): ${repliesSkipped}`);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
