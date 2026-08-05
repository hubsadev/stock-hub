# Avant-vente - Decision client et historique

## Perimetre

Enregistrement de la decision client, suivi des versions et historique.

## Ecran / action

### Action 1 - Enregistrer la decision client

- Ecran : Offre > Decision client
- Action : Marquer Retenue / Infirmée / Sans suite

### Action 2 - Creer une nouvelle version d offre

- Ecran : Offre > Versions
- Action : Creer nouvelle version

## Input

### Action 1 - Enregistrer la decision client

- Champ / donnee : decision, commentaire, date
- Source : saisie utilisateur
- Caractere obligatoire : oui pour decision
- Remarque : decision doit etre explicite

### Action 2 - Creer une nouvelle version d offre

- Champ / donnee : motif de revision, nouvelles hypotheses
- Source : saisie utilisateur
- Caractere obligatoire : oui pour les champs modifies
- Remarque : la version precedente reste accessible

## Traitement systeme

### Action 1 - Enregistrer la decision client

1. Verifier droits.
2. Verifier que l offre est envoyee.
3. Mettre a jour le statut commercial.
4. Historiser la decision.

### Action 2 - Creer une nouvelle version d offre

1. Verifier droits.
2. Cloner la version active.
3. Mettre la nouvelle version en Brouillon ou En etude.
4. Historiser la creation de version.

## Output

### Action 1 - Enregistrer la decision client

- Resultat visible : decision affichee
- Statut affiche : Retenue / Infirmée / Sans suite
- Trace creee : historique decision client
- Notification eventuelle : alerte aux parties prenantes

### Action 2 - Creer une nouvelle version d offre

- Resultat visible : nouvelle version visible
- Statut affiche : Brouillon ou En etude
- Trace creee : historique de version
- Notification eventuelle : none

## Regle metier

### Action 1 - Enregistrer la decision client

- Une offre ne peut etre marquee Retenue qu apres decision explicite du client.
- Une offre Infirmée ou Sans suite n est possible qu apres cloture commerciale.

### Action 2 - Creer une nouvelle version d offre

- Une seule version est active a un instant donne.

## Exception

### Action 1 - Enregistrer la decision client

- Cas : decision client absente ; Effet attendu : blocage.

### Action 2 - Creer une nouvelle version d offre

- Cas : version active deja envoyee ; Effet attendu : nouvelle version doit repasser par validation.

## Liens documentaires

- Relation -> [matrices/02-avant-vente.md](../../matrices/02-avant-vente.md) : décision commerciale, versioning et historique d'offre.
- Relation -> [state-transitions.md](../../state-transitions.md) : retenue, infirmée, sans suite et nouvelle version.
- Relation -> [business-rules.md](../../business-rules.md) : gestion d'une décision client sans casser la traçabilité.
- Relation -> [edge-cases.md](../../edge-cases.md) : offre refusée, version active déjà envoyée, décision partielle.
- Relation -> [user-flows.md](../../user-flows.md) : parcours décision client et mise à jour de l'historique.

## Liens inter-modules

- Relation -> [../03-contrats-affaires-projets/01-transformation-offre-contrat-projet.md](../03-contrats-affaires-projets/01-transformation-offre-contrat-projet.md) : une offre retenue déclenche la transformation en contrat puis en projet.
- Relation -> [../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md](../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md) : le statut final de l'offre se répercute dans la vue consolidée du dossier.
- Relation -> [../04-budget-pilotage-financier-projet/01-budget-initial.md](../04-budget-pilotage-financier-projet/01-budget-initial.md) : une offre retenue alimente le budget initial du projet.
