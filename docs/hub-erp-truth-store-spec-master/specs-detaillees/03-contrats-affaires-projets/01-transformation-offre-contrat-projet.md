# Contrats / Affaires / Projets - Transformation offre en contrat et projet

## Perimetre

Creation d un contrat a partir d une offre retenue et lancement du ou des projets associes.

## Ecran / action

### Action 1 - Transformer une offre retenue en contrat

- Ecran : Offre > Actions
- Action : Transformer en contrat

### Action 2 - Creer un ou plusieurs projets

- Ecran : Contrat > Actions
- Action : Initialiser projet(s)

## Input

### Action 1 - Transformer une offre retenue en contrat

- Champ / donnee : offre retenue, donnees contractuelles
- Source : systeme + saisie utilisateur
- Caractere obligatoire : offre retenue
- Remarque : la decision client doit etre actee

### Action 2 - Creer un ou plusieurs projets

- Champ / donnee : modele projet, nombre de projets, client
- Source : saisie utilisateur
- Caractere obligatoire : oui
- Remarque : rattachement a affaire si requis

## Traitement systeme

### Action 1 - Transformer une offre retenue en contrat

1. Verifier droits et statut Retenue.
2. Creer le contrat avec reference unique.
3. Lier contrat a l offre d origine.
4. Passer le contrat au statut Brouillon ou En revue.
5. Historiser la transformation.

### Action 2 - Creer un ou plusieurs projets

1. Verifier droits et statut du contrat.
2. Creer un ou plusieurs projets avec reference unique.
3. Lier projets au contrat et au client.
4. Initialiser statut projet a Cree.
5. Historiser la creation des projets.

## Output

### Action 1 - Transformer une offre retenue en contrat

- Resultat visible : contrat cree
- Statut affiche : Brouillon ou En revue
- Trace creee : historique de transformation
- Notification eventuelle : none

### Action 2 - Creer un ou plusieurs projets

- Resultat visible : projet(s) crees
- Statut affiche : Cree
- Trace creee : historique de creation
- Notification eventuelle : notification chef de projet

## Regle metier

### Action 1 - Transformer une offre retenue en contrat

- Un projet ne peut etre cree que si une offre est retenue ou un contrat signe.

### Action 2 - Creer un ou plusieurs projets

- Un contrat peut generer un ou plusieurs projets.
- Un projet doit etre rattache a un client.

## Exception

### Action 1 - Transformer une offre retenue en contrat

- Cas : offre non retenue ; Effet attendu : blocage.

### Action 2 - Creer un ou plusieurs projets

- Cas : donnees contractuelles incompletes ; Effet attendu : blocage.

## Liens documentaires

- Relation -> [matrices/03-contrats-affaires-projets.md](../../matrices/03-contrats-affaires-projets.md) : cadrage de la transformation offre -> contrat -> projet.
- Relation -> [use-cases.md](../../use-cases.md) : cas d'usage de lancement projet à partir d'une offre retenue.
- Relation -> [state-transitions.md](../../state-transitions.md) : passage de l'offre retenue au contrat signé puis au projet actif.
- Relation -> [business-rules.md](../../business-rules.md) : règles de rattachement et de transformation commerciale.
- Relation -> [permissions.md](../../permissions.md) : droits de transformation et de création projet.

## Liens inter-modules

- Relation -> [../02-avant-vente/03-validation-et-envoi-offre.md](../02-avant-vente/03-validation-et-envoi-offre.md) : l'offre validée est la source de transformation.
- Relation -> [../04-budget-pilotage-financier-projet/01-budget-initial.md](../04-budget-pilotage-financier-projet/01-budget-initial.md) : le projet initialisé sert de base au budget.
- Relation -> [../01-referentiel/01-tiers.md](../01-referentiel/01-tiers.md) : le client référentiel est conservé dans le contrat et le projet.
