/* Walkthrough: same job, three names. One small system built on each cloud in turn. */
(window.WALKS = window.WALKS || {}).atlas = (function () {
  const user = { type: "phone", x: -18, y: 2, label: "A user", screen: "violet" };
  const zone = (label, tint) => ({ type: "zone", x: -9, y: -16, w: 30, d: 30, label, tint, labelAt: "back" });
  const fn = (label) => ({ type: "block", x: -2, y: 0, label, glyph: "code", tint: "orange" });
  const bucket = (label) => ({ type: "db", x: 12, y: -10, label, tint: "violet" });
  const queue = (label) => ({ type: "queue", x: 12, y: 4, label, n: 5, dir: [1, 0] });
  const warehouse = (label) => ({ type: "db", x: 12, y: 14, label, tint: "amber" });
  const L = (from, to, extra) => Object.assign({ from, to, heads: "both" }, extra);
  const stack = (z, f, b, q, w) => ({
    ents: { zone: z, user, fn: f, bucket: b, queue: q, warehouse: w },
    links: { u: L("user", "fn"), b: L("fn", "bucket", { via: [["fn", "bucket"]] }), q: L("fn", "queue", { heads: "end" }), w: L("queue", "warehouse", { heads: "end", via: [["queue", "warehouse"]] }) },
    flows: [{ route: ["u"], bounce: true, rate: 0.3 }, { route: ["b"], bounce: true, rate: 0.35 }, { route: ["q", "w"], kind: "msg", rate: 0.4 }],
  });
  return {
    title: "Same job, three names",
    summary: "Build one small system, a function, a bucket, a queue and a warehouse, on each of the three big clouds in turn, and watch only the names change, until the small print does.",
    plain: "underneath the branding, the three big clouds rent out the same dozen kinds of thing: machines, storage, databases, queues, identity, monitoring. Learn one cloud well and the second is mostly translation. This walk builds the same small system on each cloud in turn: a function that runs when called, a bucket for files, a queue between two programs, and a warehouse for reports. Then it shows where \"the same\" stops being the same.",
    reallife: "Renting a car in three countries. Every rental desk has the same four things: a car, a tank, a key, insurance. The words on the forms differ. What catches you out is the small print: one country's \"full insurance\" has an excess, one's \"unlimited mileage\" is not.",
    startby: "Press Next to rebuild the same system on the next cloud and compare the names, then read the small print. Arrow keys work too.",
    terms: [
      ["serverless function", "code that runs only when something calls it, and is billed only for that time; no server to look after"],
      ["object storage", "a bottomless bucket for files of any size, addressed by name rather than by folder"],
      ["message queue", "a line where one program leaves work for another to pick up later, so neither waits for the other"],
      ["data warehouse", "a database built for big reports over huge tables rather than for one record at a time"],
      ["region", "the part of the world a cloud service runs in; some services span one, some several"],
      ["small print", "the behaviour that differs between two services with the same job: limits, latency, what spans a region"],
    ],
    metrics: [{ k: "cloud", label: "Cloud" }, { k: "fn", label: "The function" }, { k: "bucket", label: "The bucket" }, { k: "queue", label: "The queue" }],
    legend: [{ kind: "req", label: "a request" }, { kind: "res", label: "a reply" }, { kind: "msg", label: "a message on the queue" }],
    goals: [
      { text: "The four parts every small system is made of", step: 1 },
      { text: "The same system on the three clouds, name by name", step: 4 },
      { text: "Where the small print makes the same thing different", step: 5 },
      { text: "How to read across first, then read the small print", step: 6 },
    ],
    steps: [
      {
        short: "The job", chapter: "problem", title: "One small system, before any cloud",
        body: ["A user uploads a photo. A function resizes it and drops it in a bucket, puts a message on a queue, and a nightly job loads the day's uploads into a warehouse for reports.", "Four parts: a function, a bucket, a queue, a warehouse. Every cloud sells all four."],
        callout: { kind: "idea", text: "Name the job before the product. A bucket is a bucket; what it is called on each cloud is the second question." },
        metrics: { cloud: "none yet", fn: "a function", bucket: "a bucket", queue: "a queue" },
        scene: stack(zone("any cloud", "slate"), fn("A function"), bucket("A bucket"), queue("A queue"), warehouse("A warehouse")),
      },
      {
        short: "AWS", chapter: "technique", title: "Build it on AWS",
        body: ["The function is Lambda. The bucket is S3. The queue is SQS. The warehouse is Redshift.", "Same picture, four new names, and it works the same way."],
        changes: ["~ Lambda, S3, SQS, Redshift"],
        metrics: { cloud: "AWS", fn: "Lambda", bucket: "S3", queue: "SQS" },
        scene: stack(zone("AWS", "amber"), fn("Lambda"), bucket("S3"), queue("SQS"), warehouse("Redshift")),
      },
      {
        short: "Google Cloud", chapter: "technique", title: "Build it on Google Cloud",
        body: ["The function is a Cloud Run function. The bucket is Cloud Storage. The queue is Pub/Sub. The warehouse is BigQuery.", "Same picture again. The translation is mostly mechanical, and that is the point."],
        changes: ["~ Cloud Run functions, Cloud Storage, Pub/Sub, BigQuery"],
        metrics: { cloud: "Google Cloud", fn: "Cloud Run function", bucket: "Cloud Storage", queue: "Pub/Sub" },
        scene: stack(zone("Google Cloud", "blue"), fn("Cloud Run function"), bucket("Cloud Storage"), queue("Pub/Sub"), warehouse("BigQuery")),
      },
      {
        short: "Azure", chapter: "technique", title: "Build it on Azure",
        body: ["The function is an Azure Function. The bucket is Blob Storage. The queue is Service Bus. The warehouse is Fabric.", "Three clouds, one system, twelve names. Learn the job and the names come easily."],
        changes: ["~ Azure Functions, Blob Storage, Service Bus, Fabric"],
        metrics: { cloud: "Azure", fn: "Azure Function", bucket: "Blob Storage", queue: "Service Bus" },
        scene: stack(zone("Azure", "teal"), fn("Azure Function"), bucket("Blob Storage"), queue("Service Bus"), warehouse("Fabric")),
      },
      {
        short: "Small print", chapter: "tradeoff", title: "Where the same thing is not the same",
        body: ["Now the small print. On one cloud a bucket can span a whole continent; on the others it lives in one region. One queue promises every message arrives in order; another promises only that it arrives. One warehouse charges per query, another per hour the cluster is on.", "The picture is identical. The behaviour under it is not, and the differences are exactly where migrations go wrong."],
        callout: { kind: "warn", text: "When two services have the same job, ask three things: what spans a region, what is guaranteed, and what you pay per. The answers differ more than the names." },
        changes: ["~ Bucket: one region or a continent", "~ Queue: ordered, or merely delivered", "~ Warehouse: per query, or per hour"],
        metrics: { cloud: "all three", fn: "same job", bucket: { v: "region vs continent", tone: "amber" }, queue: { v: "ordered vs delivered", tone: "amber" } },
        scene: (() => { const s = stack(zone("the small print", "rose"), fn("A function"), bucket("A bucket"), queue("A queue"), warehouse("A warehouse")); s.ents.bucket.tags = [{ text: "one region, or a continent?", tone: "amber" }]; s.ents.queue.tags = [{ text: "in order, or just delivered?", tone: "amber" }]; s.ents.warehouse.tags = [{ text: "per query, or per hour?", tone: "amber" }]; return s; })(),
      },
      {
        short: "Method", chapter: "solution", title: "Read across first, then read the small print",
        body: ["The method for any new cloud, or any new service: name the job, find the service with that job, then read its small print against the one you know.", "Most of the time the translation is enough. The rest of the time the small print is the whole answer, and you knew to look."],
        metrics: { cloud: "any", fn: "translate", bucket: "translate", queue: "then check the print" },
        scene: (() => { const s = stack(zone("any cloud", "slate"), fn("A function"), bucket("A bucket"), queue("A queue"), warehouse("A warehouse")); s.ents.user = Object.assign({}, user, { tags: [{ text: "name the job → find it → read the print", tone: "blue", dx: 70 }] }); return s; })(),
      },
      {
        short: "Recap", chapter: "recap", title: "Recap",
        recap: ["Every small system is a few <b>jobs</b>: a function, a bucket, a queue, a warehouse.", "All three clouds sell all of them; the <b>names</b> are mostly translation.", "The <b>small print</b> differs: what spans a region, what is guaranteed, what you pay per.", "<b>Read across first</b>, then read the small print."],
        callout: { kind: "next", text: "The rest of this lab is the atlas itself: every service, a depth map, a stack builder, what was renamed lately, and the look-alikes that are not quite the same." },
        metrics: { cloud: "any", fn: "translate", bucket: "translate", queue: "then check the print" },
      },
    ],
  };
})();
