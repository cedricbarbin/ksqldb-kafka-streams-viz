# Kafka Streams Topology Visualizer

A tool helps visualizing stream topologies by generating nice looking diagrams from a kafka stream topology descriptions.

You might experiment issue with CORS rules : configure your ksqlDB API to allow this source, or use a plugin like [Moesif CORS](https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc).

## [Try now](https://zz85.github.io/kafka-streams-viz)

This was conceived during one of the lab days @ Zendesk Singapore.

Thanks to the following libraries
1. [Viz.js](https://github.com/mdaines/viz.js/) an emscripten built of Graphviz
2. [rough.js](https://github.com/pshihn/rough/) for generating hand-drawn like diagrams.
