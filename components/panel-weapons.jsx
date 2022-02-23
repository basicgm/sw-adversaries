
import React from "react";
import Remarkable from "remarkable";
import { dice, symbolise, minionSkill } from "lib/utils";
import { id } from "lib/string";
import { sortByProperty } from "lib/list";
import * as CONFIG from "lib/config";

function getWeaponDetails(weapon, character, allSkills, aliveMinions) {
	if(!("id" in weapon)) {
		weapon.id = id(weapon.name);
	}

	// melee weapon so work out brawn damage
	if("plus-damage" in weapon) {
		weapon["damage"] = weapon["plus-damage"] + character.characteristics.Brawn;
	}

	if(!("qualities" in weapon)) {
		weapon.qualities = [];
	}

	if("arc" in weapon) {
		weapon.skill = "Gunnery";
	}

	// get dice values
	let skill = allSkills.find(s => s.name == weapon.skill);

	if(skill == null) {
		weapon.images = [];

		return weapon;
	}

	let stat = character.characteristics[skill.characteristic] || 0;
	let value = character.skills[weapon.skill] || 0;

	if(character.type == CONFIG.MINION) {
		value = minionSkill(aliveMinions, weapon.skill, character.skills);
	}

	weapon.icons = dice(stat, value);

	// add any notes as a quality
	if("notes" in weapon && weapon.qualities.indexOf("Notes") == -1) {
		weapon.qualities.push("Notes");
	}

	weapon.qualities.sort();

	return weapon;
}

export default class PanelWeapons extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			quality: null
		};

		this.md = new Remarkable();
	}

	setQuality(evt) {
		let name = evt.target.innerText.replace(/\s\d+$/, "");
		let quality = null;

		if(name == "Notes") {
			let id = evt.target.getAttribute("data-weapon");
			let weapon = this.props.weapons.all().concat(this.props.vehicle ? this.props.vehicle.weapons : this.props.character.weapons).find(w => w.id == id);

			quality = {
				name: "Notes",
				type: "",
				description: weapon.notes
			}
		}
		else {
			let allQualities = this.props.qualities.all().concat(this.props.talents.all());

			quality = allQualities.find(q => q.name == name);
		}

		if(quality) {
			this.setState({
				quality: quality
			});
		}
	}

	hideQuality(evt) {
		this.setState({
			quality: null
		});
	}

	componentWillUpdate(nextProps, nextState) {
		if(nextProps.character !== this.props.character || nextProps.vehicle != this.props.vehicle) {
			this.setState({
				quality: null
			});
		}
	}

	render() {
		if(this.props.character == null) {
			return null;
		}

		let character = this.props.character;
		let weapons = [];
		let allWeapons = this.props.weapons != null ? this.props.weapons.all() : null;
		let allSkills = this.props.skills != null ? this.props.skills.all() : null;

		if(allWeapons == null || allSkills == null) {
			return null;
		}

		// in order use if available: vehicle weapons, character weapons, an empty array
		(character.weapons || []).forEach(w => {
			let weapon = w instanceof Object ? w : allWeapons.find(a => a.name == w);

			if(weapon) {
				weapons.push(getWeaponDetails(weapon, character, allSkills, this.props.aliveMinions));
			}
		});

		weapons.sort(sortByProperty("name"));

		// add vehicle weapons to the buttom of the list
		if(this.props.vehicle != null && this.props.vehicle.weapons != null) {
			let vehicleWeapons = [];

			this.props.vehicle.weapons.forEach(weapon => vehicleWeapons.push(getWeaponDetails(weapon, character, allSkills, this.props.aliveMinions)));

			vehicleWeapons.sort(sortByProperty("name"));

			weapons = weapons.concat(vehicleWeapons);
		}

		let hasShipWeapon = weapons.filter(f => f.arc).length > 0;

		return <div className="info">
			<h2>Weapons</h2>
			{ weapons.length == 0 ? <p>–</p> :
			<table className="weapons">
				<thead>
					<tr>
						{ hasShipWeapon ? <th></th> : null }
						<th>Weapon</th>
						<th>Range</th>
						<th>Damage</th>
						<th className="hide-xsmall hide-small">Roll { character.type == CONFIG.MINION
							? <small> (for { this.props.minions })</small>
							: null }
						</th>
						<th>Qualities / Mods</th>
					</tr>
				</thead>
				<tbody>
					{ weapons.map(w => {
						return <tr key={ w.id }>
							{ hasShipWeapon ? <td>{ w.arc ? <svg><use xlinkHref="#icon-ship"></use></svg> : null }</td> : null }
							<td className="small-rows">
								{ w.name }
								<small>{ w.skill }</small>
								{ w.arc ? <small><strong>Fire Arc:</strong> { w.arc }</small> : null }
								<div className="hide-medium hide-large hide-xlarge" dangerouslySetInnerHTML={ w.icons } />
							</td>
							<td><small>{ w.range }</small></td>
							<td>
								<div className="damage"><small className="hide-xsmall hide-small">Damage:</small> { w.damage || "–" }</div>
								<div className="damage"><small className="hide-xsmall hide-small">Critical:</small> { w.critical || "–" }</div>
							</td>
							<td className="hide-xsmall hide-small" dangerouslySetInnerHTML={ w.icons } />
							<td>{ w.qualities.length == 0 ?  "–" : w.qualities.map(q => <div key={ id(q) }><span className="link" onClick={ this.setQuality.bind(this) } data-weapon={ w.id }>{ q }</span></div>) }</td>
						</tr>
					}) }
				</tbody>
			</table> }
			{ this.state.quality != null ? <div className="quality">
				<h3>{ this.state.quality.name } { this.state.quality.name == "Notes" ? "" : <small>({ this.state.quality.type || "Passive" })</small> }</h3>
				{ this.state.quality.description.split("\n\n").map((l, i) => <p key={ i } dangerouslySetInnerHTML={ symbolise(this.md.render(l)) } />) }
				<div className="text-right">
					<small className="btn" onClick={ this.hideQuality.bind(this) }><span className="fa fa-close"></span> Close</small>
				</div>
			</div> : null }
		</div>;
	}
}
