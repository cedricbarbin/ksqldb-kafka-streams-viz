function getFromServer() {
	// retrieve form informations
	const server = document.getElementById("url").value;
	const topics = document.getElementById("final-topics").value.split(";");

	const queryIds = [];
	const topologies = [];

	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "text/plain");
	myHeaders.append("origin", "http://my-web-server.com");
	var raw = "{\"ksql\": \"SHOW QUERIES;\",  \"streamsProperties\": {}}";

	var options = {
	  method: "POST",
	  headers: myHeaders,
	  body: raw,
	  credentials: "include",
	  redirect: "follow"
	};

	fetch(server, options)
	  .then(response => response.text()
	  .then(showQueryResponseBody => {
			const queriesResponse = JSON.parse(showQueryResponseBody + "");
			//console.log(queriesResponse)

			let i = topics.length;
			const execAndWait = async () => {
				while(i>0) {
					i = 0;
					const sinkNames = [].concat(topics);
					for (let sink of sinkNames) {
						console.log("Try to find query with sink " + sink)
						for (let queryResponse of queriesResponse) {
							for (let query of queryResponse.queries) {
								if (query.sinks.includes(sink)) {
									if(!queryIds.includes(query.id)){
										//console.log(queryIds)
										queryIds.push(query.id);
										console.log("New QUERY : " + query.id);
										options.body = `{"ksql": "EXPLAIN ${query.id};","streamsProperties": {}}`
										//console.log(options.body)
									    const response = await fetch(server, options)
									    const explainQueryIdBodyStr = await response.text();
										const explainQueryIdBody = JSON.parse(explainQueryIdBodyStr);
										//console.log(explainQueryIdBody)
										for (let explainQuery of explainQueryIdBody) {
											for (let source of explainQuery.queryDescription.sources) {
												if(!topics.includes(source)) {
													i = i + 1
													//console.log(topics)
													console.log("New SOURCE : " + source)
													topics.push(source)
												}
											}
											//console.log("New TOPOLOGY : " + explainQuery.queryDescription.topology)
											topologies.push(explainQuery.queryDescription.topology);
										}
									}
								}
							}
						}
					}
				console.log(i)
				}

				topologies.reverse();

				let finalQueries = ""

				for (let i = 0; i < queryIds.length; i++) {
					finalQueries = finalQueries + "\n" + queryIds[i]
				}
				document.getElementById("queries").value = finalQueries

				let finalTopology = ""

				for (let i = 0; i < topologies.length; i++) {
					let tmpTopology = topologies[i]
					let id = i + 1
					if (i != 0) {
						tmpTopology = tmpTopology.replaceAll("Topologies:", "");
					}
					tmpTopology = tmpTopology.replaceAll("Sub-topology: ", "Sub-topology: "+(id*100))
					tmpTopology = tmpTopology.replaceAll("-000000", "-"+id+"000000")
					
					tmpTopology = tmpTopology.replaceAll("stores: [", "stores: ["+id+"-")
					tmpTopology = tmpTopology.replaceAll("stores: ["+id+"-]", "stores: []")

					tmpTopology = tmpTopology.replaceAll("topics: [", "topics: ["+id+"-")
					tmpTopology = tmpTopology.replaceAll(new RegExp("SOURCE(.*)topics: \\["+id+"-", "g"), "SOURCE$1topics: [")
					
					tmpTopology = tmpTopology.replaceAll("topic: ", "topic: "+id+"-")
					tmpTopology = tmpTopology.replaceAll(new RegExp("SINK(.*)topic: "+id+"-", "g"), "SINK$1topic: ")

					tmpTopology = tmpTopology.replaceAll(new RegExp("([A-Z][a-zA-Z-]+) \\(", "g"), "$1-"+id+" (")
					tmpTopology = tmpTopology.replaceAll(new RegExp("([A-Z][a-zA-Z-]+)(\\n)", "g"), "$1-"+id+"$2")

					console.log(tmpTopology)
					finalTopology = finalTopology + "\n" + tmpTopology
				}
				document.getElementById("input").value = finalTopology
				update()

			}
			execAndWait();
		}))
		.catch(error => console.error('error', error));
}