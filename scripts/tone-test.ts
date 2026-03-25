import * as Tone from "tone";

async function test() {
	const ctx = new Tone.OfflineContext(2, 2, 44100);
	Tone.setContext(ctx);

	Tone.getTransport().bpm.value = 240; // Double speed (120 -> 240)

	const part = new Tone.Part(
		(time, _value) => {
			console.log(
				`Event executed at AudioContext time ${time}, Transport.seconds is ${Tone.getTransport().seconds}`,
			);
		},
		[{ time: 1, value: "note1" }],
	);

	part.start(0);
	Tone.getTransport().start(0);

	await ctx.render();
	console.log("Done");
}

test();
