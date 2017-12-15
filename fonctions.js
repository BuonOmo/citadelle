/* ====== BATAILLES ====== */


/* constantes */

var string = ['sol', 'cat', 'bal', 'piq', 'cav', 'arc', 'pal', 'che', 'arm']
var UnitesPv = [50, 60, 60, 70, 70, 70, 100, 70, 80]

/* variables */

//type : 0:soldat ; 1:catapulte ; 2:baliste ; 3:piquier ; 4:cavalier ; 5:archer ; 6:paladin ; 7:chevalier ; 8:archer monté
//adv : 0:Attaquant ; 1:Défenseur
//info : 0:type ; 1:numéro

var TotalUnites = [] //=[nombre d'unités en vie de l'attaquant, nombre d'unités en vie du défenseur]
var TotalUnitesParType = [] //UnitesParType[adv][type]=nombre d'unités en vie et pas en duel de type type de l'adv
var nbrUniteEnForme = [] //nbrUniteEnForme[adv][type]=nombre d'unités en forme de type type de l'adv
var Unites = [] //Unites[adv][type][n] = PV de la nième unité de type type de l'adv. (tableau trié ainsi : [en duel, ..., en duel, blessé, blessé, ..., blessé])
var Duels = [] //Duels[n][adv][info] = info de l'unité de l'adv du duel numéro n.


function Launcher() {
	var nbrSimulations = document.getElementById('input_nbrsimulations').value
	var Issues = [0, 0, 0]
	var Issue
	var Temps = []
	var countSimulations = 0
	var autredonnee = [0, , 0, 0] //[comptage pour Maj, tps min, tps moyen, tps max]
	var timeStart = new Date().getTime()
	var options = [document.getElementById('options_tps_maj').value, document.getElementById('options_nbr_maj_ex').value, document.getElementById('options_pourcentage').value, Math.pow(10, document.getElementById('options_precision').value)]
	Loop(nbrSimulations, Issues, Issue, Temps, countSimulations, timeStart, options, autredonnee)
}

function Loop(nbrSimulations, Issues, Issue, Temps, countSimulations, timeStart, options, autredonnee) {
	var timeB = new Date().getTime()
	var i = 0
	while (new Date().getTime() - timeB < options[0] && countSimulations < nbrSimulations) {
		countSimulations++
		Issue = Main(autredonnee[0] + i, options[3])
		Issues[Issue[0]] += 1
		//Temps.push(Issue[1]);
		if (!(autredonnee[1] < Issue[1])) autredonnee[1] = Issue[1]
		else if (autredonnee[3] < Issue[1]) autredonnee[3] = Issue[1]
		autredonnee[2] = (autredonnee[2] * (countSimulations - 1) + Issue[1]) / countSimulations
		i++
	}
	document.getElementById('moyenne_th').innerHTML = ('Moyenne (sur ' + countSimulations + ' simulations)')
	document.getElementById('infos').innerHTML = ('<p>Temps restant : ' + Math.floor((new Date().getTime() - timeStart) * (nbrSimulations - countSimulations) / countSimulations / 1000) + ' secondes. (' + Math.round(i * 1000 / (new Date().getTime() - timeB)) + ' simulations/sec)</p>')
	if (options[2] == 'O') {
		document.getElementById('vic_att').innerHTML = (Math.round(options[3] * 100 * Issues[0] / countSimulations)) / options[3] + '%'
		document.getElementById('vic_def').innerHTML = (Math.round(options[3] * 100 * Issues[1] / countSimulations)) / options[3] + '%'
		document.getElementById('vic_ega').innerHTML = (Math.round(options[3] * 100 * Issues[2] / countSimulations)) / options[3] + '%'
	}
	else {
		document.getElementById('vic_att').innerHTML = Issues[0]
		document.getElementById('vic_def').innerHTML = Issues[1]
		document.getElementById('vic_ega').innerHTML = Issues[2]
	}
	document.getElementById('tps_min').innerHTML = (autredonnee[1] + 'min')
	document.getElementById('tps_moy').innerHTML = ((Math.round(options[3] * autredonnee[2]) / options[3]) + 'min')
	document.getElementById('tps_max').innerHTML = (autredonnee[3] + 'min')

	autredonnee[0] = (autredonnee[0] + 1) % options[1]
	if (countSimulations < nbrSimulations) setTimeout(Loop, 0, nbrSimulations, Issues, Issue, Temps, countSimulations, timeStart, options, autredonnee)
}

function Main(Simulation, prec) {
	Initialisation()
	var adv, type, n, degats, Maj, i, j, gagnant, Moyenne = [], len, EType = [], StrGagnant
	var Chrono = 0 //temps que dure la bataille
	var nbrDuels = CountDuels()
	for (n = 0; n < nbrDuels; n++) {
		ChooseDuels()
	}
	while (nbrDuels > 0) {
		Chrono += 2 //un round (2 minutes) est joué
		for (i = 0; i < nbrDuels; i++) //pour chaque duel
		{
			for (adv = 0; adv < 2; adv++) {
				degats = Math.floor(Math.random() * 2) + 1 // 1 ou 2
				if (Duels[i][adv][0] == 1 + adv && Duels[i][1 - adv][0] != 8) {
					degats += 4
				} // cata (ou baliste) vs !AM => 5 ou 6
				else if (Duels[i][adv][0] == 3 && (Duels[i][1 - adv][0] == 4 || Duels[i][1 - adv][0] == 7)) {
					degats += 3
				} //piquier vs cavalier ou chevalier
				else if (Duels[i][adv][0] == 4 && Duels[i][1 - adv][0] == 5) {
					degats += 2
				} //cavalier vs archer
				else if (Duels[i][adv][0] == 5 && (Duels[i][1 - adv][0] == 3 || Duels[i][1 - adv][0] == 6)) {
					degats += 2
				} //archer vs piquier ou paladin
				else if (Duels[i][adv][0] == 7 && Duels[i][1 - adv][0] == 0) {
					degats += 2
				} //chevalier vs soldat
				Unites[1 - adv]/**/[Duels[i][1 - adv][0]]/**/[Duels[i][1 - adv][1]] -= degats //on inflige les dégats
			}
		}
		Maj = [] //quels duels sont terminés ?
		for (i = 0; i < nbrDuels; i++) {
			if (Unites[0]/**/[Duels[i][0][0]]/**/[Duels[i][0][1]] <= 0 || Unites[1]/**/[Duels[i][1][0]]/**/[Duels[i][1][1]] <= 0) //si un duel est fini
			{
				for (adv = 0; adv < 2; adv++) {
					type = Duels[i][adv][0]
					n = Unites[adv][type].length + nbrUniteEnForme[adv][type] - TotalUnitesParType[adv][type] //nombre d'adv type en duel
					if (n - 1 != Duels[i][adv][1]) swapDuels(adv, type, Duels[i][adv][1], n - 1) //on échange avec la dernière unité en duel si elle ne l'est déjà
					if (Unites[adv]/**/[Duels[i][adv][0]]/**/[Duels[i][adv][1]] <= 0) //si l'unité est morte
					{
						TotalUnites[adv]--
						if (nbrUniteEnForme[adv][type] != TotalUnitesParType[adv][type]) Unites[adv][type][n - 1] = Unites[adv][type].pop() //s'il y a des blessé, on place le dernier à la place du mort
						else Unites[adv][type].pop() //sinon, on supprime juste celle-là
					}
					else {
						TotalUnitesParType[adv][type]++
					}
				}
				Maj.push(i)
			}
		}

		if (Maj.length != 0) {
			len = Maj.length
			j = 0
			for (i = 0; i + j < nbrDuels; i++) //On met les duels utiles au début de Duels
			{
				if (j < len && i + j == Maj[j]) {
					j++
					i--
				}
				else {
					Duels[i] = Duels[i + j]
				}
			}
			for (i = 0; i < len; i++) Duels.pop() //on supprime les duels inutiles
			nbrDuels = CountDuels()
			for (n = Duels.length; n < nbrDuels; n++) {
				ChooseDuels()
			} //on tire les derniers duels
		}
	}

	if (TotalUnites[0] != 0) gagnant = 0
	else if (TotalUnites[1] != 0) gagnant = 1
	else gagnant = 2
	if (Simulation == 0) { //si on veut afficher
		if (gagnant != 2) {
			for (type = 0; type < 9; type++) { //moyenne
				if (Unites[gagnant][type].length != 0) {
					Moyenne.push((sum(Unites[gagnant][type])) / Unites[gagnant][type].length)
				}
				else {
					Moyenne.push(0)
				}
			}
			for (type = 0; type < 9; type++) { //ecart type
				j = 0
				for (i = 0, len = Unites[gagnant][type].length; i < len; i++)
					j += Math.pow(Unites[gagnant][type][i] - Moyenne[type], 2)
				if (Unites[gagnant][type].length != 0) {
					EType.push(Math.sqrt(j / Unites[gagnant][type].length))
				}
				else EType.push(0)
			}
			if (gagnant == 0) {
				StrGagnant = 'L\'attaquant'
			} else {
				StrGagnant = 'Le défenseur'
			}
			document.getElementById('gagnant').innerHTML = StrGagnant + ' l\'emporte (en ' + Chrono + ' minutes)'
		}
		else {
			document.getElementById('gagnant').innerHTML = 'Egalité parfaite (en ' + Chrono + ' minutes) !'
			Moyenne = [0, 0, 0, 0, 0, 0, 0, 0, 0]
			EType = [0, 0, 0, 0, 0, 0, 0, 0, 0]
		}
		for (i = 0; i < 9; i++) {
			document.getElementById(string[i] + '_res').innerHTML = Unites[gagnant % 2][i].length
			document.getElementById(string[i] + '_ind').innerHTML = nbrUniteEnForme[gagnant % 2][i]
			document.getElementById(string[i] + '_moy').innerHTML = Math.round(Moyenne[i] * prec) / prec
			document.getElementById(string[i] + '_eca').innerHTML = Math.round(EType[i] * prec) / prec
		}
		if (document.getElementById('tbl_batailles_fin')) {
			document.getElementById('tbl_batailles_fin').id = 'tbl_batailles_fin_displayed'
		}
	}
	return [gagnant, Chrono]
}

/*
 * Initialisation
 * Prend les données entrées sur le simulateur pour les stocker dans Unites, et modifie TotalUnites en conséquence
 */
function Initialisation() {
	var i, j, adv, type, a
	TotalUnitesParType = [[], []]
	nbrUniteEnForme = [[], []]
	Duels = []
	var TotalUnitesParTypeInput = [document.getElementById('ini_att').getElementsByTagName('input'), document.getElementById('ini_def').getElementsByTagName('input')]
	for (i = 0; i < 2; i++) {
		for (j = 0; j < 9; j++) {
			if (TotalUnitesParTypeInput[i][j].value > 0) {
				a = parseInt(TotalUnitesParTypeInput[i][j].value)
			} else {
				a = 0
			}
			TotalUnitesParType[i].push(a)
			nbrUniteEnForme[i].push(a)
		}
	}
	TotalUnites = [sum(TotalUnitesParType[0]), sum(TotalUnitesParType[1])]
	Unites = [[[], [], [], [], [], [], [], [], []], /**/[[], [], [], [], [], [], [], [], []]]
	/* ← Rq : Moche */
}

/*
 * CountDuels
 * Calcule le nombre de duels qui doivent avoir lieu.
 *
 * @return : nombre de duels
 */
function CountDuels() {
	var A, a //taille de la grande armée, taille de la petite armée
	if (TotalUnites[0] > TotalUnites[1]) {
		A = TotalUnites[0]
		a = TotalUnites[1]
	}
	else {
		A = TotalUnites[1]
		a = TotalUnites[0]
	}
	//formule du nombre de duel (cfr IPK)
	var nbrDuels = Math.max(1, (Math.min(7, a, Math.ceil(A / 3)) - document.getElementById('input_mur').value))
	if (TotalUnites[0] == 0 || TotalUnites[1] == 0) {
		nbrDuels = 0
	}
	return nbrDuels
}

/*
 * ChooseDuels
 * Choisit deux unités au hasard pour faire un duel, et met Duels à jour
 */
function ChooseDuels() {
	var type, aleat, adv, stock = [[], []], nbrdueltype, temp
	for (adv = 0; adv < 2; adv++) {
		aleat = Math.floor((TotalUnites[adv] - Duels.length) * Math.random()) //on prend un attaquant au hasard
		//alert ("TotalUnites[adv] - Duels.length : "+(TotalUnites[adv]-Duels.length)+". TotalUnitesParType["+adv+"][0] : "+TotalUnitesParType[adv][0]+". Nombre de Duels : "+Duels.length);
		for (type = 0; aleat >= TotalUnitesParType[adv][type]; type++) {
			aleat -= TotalUnitesParType[adv][type]
		} //on cherche le type de l'unité
		//alert("TotalUnitesParType["+adv+"]["+type+"] : "+TotalUnitesParType[adv][type]);
		nbrdueltype = Unites[adv][type].length + nbrUniteEnForme[adv][type] - TotalUnitesParType[adv][type]
		aleat += nbrdueltype //on passe la partie duel de Unites
		if (aleat >= Unites[adv][type].length) //si il faut prendre une unité en forme
		{
			if (TotalUnitesParType[adv][type] > nbrUniteEnForme[adv][type]) {
				Unites[adv][type].push(Unites[adv][type][nbrdueltype])
				Unites[adv][type][nbrdueltype] = UnitesPv[type]
			}
			else Unites[adv][type].push(UnitesPv[type]) //si pas de blessé
			nbrUniteEnForme[adv][type]--
		}
		else //si il faut prendre une unité blessée
		{
			temp = Unites[adv][type][nbrdueltype]
			Unites[adv][type][nbrdueltype] = Unites[adv][type][aleat]
			Unites[adv][type][aleat] = temp //on échange l'unité à mettre en duel avec la première blessée.
		}
		TotalUnitesParType[adv][type]--
		stock[adv] = [type, nbrdueltype]
	}
	Duels.push(stock) //et on met les données des deux unités dans le tableau des duels
}

/*
 * swapDuels
 * permet d'échanger deux unités de Unites (de la section duel) en mettant Duels à jour.
 *
 * @adv : joueur dont on veut échanger l'ordre
 * @type : type dont on veut échanger l'ordre
 * @num1 : numéro de l'unité à déplacer
 * @num2 : numéro de l'autre unité à déplacer
 */
function swapDuels(adv, type, num1, num2) {
	var temp
	temp = Unites[adv][type][num1]
	Unites[adv][type][num1] = Unites[adv][type][num2]
	Unites[adv][type][num2] = temp
	temp = searchDuel(adv, type, num2)
	Duels[searchDuel(adv, type, num1)][adv][1] = num2
	Duels[temp][adv][1] = num1
}

/*
 * searchDuel
 * recherche le numéro du duel dont l'unité est unites[adv][type][num]
 *
 * @adv : joueur dont on veut trouver le duel
 * @type : type dont on veut trouver le duel
 * @num : numéro de l'unité dont on veut trouver le duel
 * @return : numéro du duel
 */
function searchDuel(adv, type, num) {
	var i
	for (i = 0; i < Duels.length; i++)
		if (Duels[i][adv][0] == type && Duels[i][adv][1] == num)
			return i
	alert('not found : ' + Duels.length)
	alert(Duels)
	return -1
}

/*
 * sum
 * Calcule la somme des éléments d'un tableau
 *
 * @tab : tableau d'entier dont on calcule la somme
 * @return : somme des éléments du tableau
 */
function sum(tab) {
	var somme = 0, i, len
	for (i = 0, len = tab.length; i < len; i++) {
		somme += parseInt(tab[i])
	}
	return somme
}

/*
 * VerifyMur
 * Vérifie que la valeur entrée pour le mur est correcte.
 *
 * @Niveau : valeur entrée pour le mur
 */
function VerifyMur(Niveau) {
	if (Niveau != 0 && Niveau != 1 && Niveau != 2 && Niveau != 3 && Niveau != 4 && Niveau != 5) {
		document.getElementById('input_mur').value = 0
		alert('Le niveau du mur doit être un entier entre 0 et 5.')
	}
}

/*
 * VerifyNbrSimulations
 * Vérifie que la valeur entrée pour le nombre de simulations est correcte.
 *
 * @Niveau : valeur entrée pour le nombre de simulations
 */
function VerifyNbrSimulations(number) {
	if (!(0 < number)) {
		document.getElementById('input_nbrsimulations').value = 1000
		alert('Le nombre de simulations doit être un entier strictement positif.')
	}
}

function VerifyTpsSim(number) {
	if (!(0 < number)) {
		document.getElementById('options_tps_maj').value = 1000
		alert('Le temps entre chaque mise à jour doit être un entier strictement positif.')
	}
}

function VerifyExemple(number) {
	if (!(0 < number)) {
		document.getElementById('options_nbr_maj_ex').value = 3
		alert('Le nombre doit être un entier strictement positif.')
	}
}

function VerifyPourcentage(rep) {
	if (rep != 'O' && rep != 'N') {
		document.getElementById('options_pourcentage').value = 'O'
		alert('Entrez soit N (nombre exact), soit O (pourcentage)')
	}
}

function VerifyPrecision(prec) {
	if (!(0 <= prec)) {
		document.getElementById('options_precision').value = 0
		alert('Le nombre de chiffre après la virgule doit être positif.')
	}
}


/* ====== COMMERCE ====== */


function fCommerce() {
	var solTotal = document.getElementById('nb_sol').value
	var comIniA = document.getElementById('ini_A').value
	var comIniB = document.getElementById('ini_B').value
	var comFinA = document.getElementById('fin_A').value
	var comFinB = document.getElementById('fin_B').value

	var i, j, k, solReste, k
	var nom = [document.getElementById('nom_A').value, document.getElementById('nom_B').value]

	var com = [[comIniA, comFinA], [comIniB, comFinB]]
	var min = [[0, 0], [0, 0]]
	for (i = 0; i < 2; i++) {
		for (j = 0; j < 2; j++) {
			if (com[i][j] > 0) {
				min[i][j] = Math.ceil((com[i][j] / 2))
			} else {
				min[i][j] = 1
			}
		}
	}
	solReste = solTotal - (min[0][0] + min[1][0])
	var Resultats = [[[0, 0], [0, 0]], [[0, 0], [0, 0]]]
	for (i = 0; i < 2; i++) {
		for (j = 0; j < 2; j++) {
			k = 0
			if (j == 1) {
				k = -(min[1 - Math.abs(j - i)][1] - min[1 - Math.abs(j - i)][0])
			}
			Resultats[0][i][j] = fTours(com[Math.abs(j - i)][0], com[Math.abs(j - i)][1], solReste + min[Math.abs(j - i)][0] + k)
		}
	}
	for (i = 0; i < 2; i++) {
		for (j = 0; j < 2; j++) {
			k = 0
			/**/
			if (j == 1) {
				k = -(min[1 - Math.abs(j - i)][1] - min[1 - Math.abs(j - i)][0])
			}
			Resultats[1][i][j] = fEntretien(com[Math.abs(j - i)][0], com[Math.abs(j - i)][1], solReste + min[Math.abs(j - i)][0] + k, i, j, com)
		}
	}
	if ((Resultats[1][0][0] + Resultats[1][0][1] + (solTotal * (Resultats[0][0][0] + Resultats[0][0][1]))) >= (Resultats[1][1][0] + Resultats[1][1][1] + (solTotal * (Resultats[0][1][0] + Resultats[0][1][1])))) {
		k = 1
	} else {
		k = 0
	}
	document.getElementById('resultats').innerHTML = '<h3>Si vous choisissez de monter ' + nom[k] + ' en premier :</h3>'
	document.getElementById('resultats').innerHTML += '<p>Dans un premier temps monter <b>' + nom[k] + '</b> avec ' + (solTotal - min[1 - k][0]) + ' soldats. Cela prendra <b>' + Math.ceil(Resultats[0][k][0]) + '</b> tours et coûtera <b>' + Math.round(Resultats[1][k][0]) + '</b> or.</p>'
	document.getElementById('resultats').innerHTML += '<p>Ensuite il faudra monter <b>' + nom[1 - k] + '</b> avec ' + (solTotal - min[k][1]) + ' soldats. Cela prendra <b>' + Math.ceil(Resultats[0][k][1]) + '</b> tours et coûtera <b>' + Math.round(Resultats[1][k][1]) + '</b> or.</p>'
	document.getElementById('resultats').innerHTML += '<p>Au total l\'opération prendra <b>' + Math.ceil(Resultats[0][k][0] + Resultats[0][k][1]) + '</b> tours et coûtera <b>' + Math.round(Resultats[1][k][0] + Resultats[1][k][1]) + '</b> or (<b>' + (Math.round((Resultats[1][k][0] + Resultats[1][k][1]) + ((Math.ceil(Resultats[0][k][0] + Resultats[0][k][1])) * solTotal))) + '</b> en comptant les dépenses liées à l\'entretien des soldats).</p>'
	document.getElementById('resultats').innerHTML += '<h3>Si vous choisissez de monter ' + nom[1 - k] + ' en premier :</h3>'
	document.getElementById('resultats').innerHTML += '<p>Dans un premier temps monter <b>' + nom[1 - k] + '</b> avec ' + (solTotal - min[k][0]) + ' soldats. Cela prendra <b>' + Math.ceil(Resultats[0][1 - k][0]) + '</b> tours et coûtera <b>' + Math.round(Resultats[1][1 - k][0]) + '</b> or.</p>'
	document.getElementById('resultats').innerHTML += '<p>Ensuite il faudra monter <b>' + nom[k] + '</b> avec ' + (solTotal - min[1 - k][1]) + ' soldats. Cela prendra <b>' + Math.ceil(Resultats[0][1 - k][1]) + '</b> tours et coûtera <b>' + Math.round(Resultats[1][1 - k][1]) + '</b> or.</p>'
	document.getElementById('resultats').innerHTML += '<p>Au total l\'opération prendra <b>' + Math.ceil(Resultats[0][1 - k][0] + Resultats[0][1 - k][1]) + '</b> tours et coûtera <b>' + Math.round(Resultats[1][1 - k][0] + Resultats[1][1 - k][1]) + '</b> or (<b>' + (Math.round((Resultats[1][1 - k][0] + Resultats[1][1 - k][1]) + ((Math.ceil(Resultats[0][1 - k][0] + Resultats[0][1 - k][1])) * solTotal))) + '</b> en comptant les dépenses liées à l\'entretien des soldats).</p>'
	document.getElementById('resultats').innerHTML += '<h3>Il faut donc monter ' + nom[k] + ' en premier.</h3>'
}

function fTours(ini, fin, sol) {
	var Tours = 0
	for (i = ini; i < fin; i++) {
		if (i < 0) {
			Tours = Tours + ((10 * Math.abs(i)) / (sol))
		}
		else {
			Tours = Tours + ((20 * (Math.abs(i) + 1)) / ((2 * sol) - Math.abs(i)))
		}
	}
	return Tours
}

function fEntretien(ini, fin, sol, territoire, etape, com) {
	var Tours = 0
	var Entretien = 0
	for (i = ini; i < fin; i++) {
		if (i < 0) {
			Tours = ((10 * Math.abs(i)) / (sol))
		}
		else {
			Tours = ((20 * (Math.abs(i) + 1)) / ((2 * sol) - Math.abs(i)))
		}
		Entretien += (Tours * i)
		Entretien += (Tours * com[1 - Math.abs(etape - territoire)][etape])
	}
	Entretien = -Entretien
	return Entretien
}
