import { @Vigilant, @SwitchProperty } from '../Vigilance/index';

@Vigilant("BetterPMManager")
class Settings {

	@SwitchProperty({
		name: "Hide DMs In GUI",
		description: "Hide the Hypixel-sent to/from messages when in the BetterPM GUI (love ya himty)",
		category: "General"
	})
	hidedms = true;

	@SwitchProperty({
		name: "Click DMs to Open GUI",
		description: "Click on the in-chat Hypixel DM messages to open the BetterPM GUI",
		category: "General"
	})
	clickdms = false;

	constructor() {
		this.initialize(this);
		this.setCategoryDescription("General","BetterPMManager by loppers");
	}
}

export default new Settings;