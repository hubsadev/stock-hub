# Avant-vente - Demande de cotation

## Perimetre

Creation et gestion d une demande de cotation et de ses informations essentielles.

## Ecran / action

### Action 1 - Creer une demande de cotation

- Ecran : Avant-vente > Demandes de cotation > Creer
- Action : Enregistrer

### Action 2 - Associer un client et une date limite

- Ecran : Demande de cotation > Fiche
- Action : Enregistrer les informations

## Input

### Action 1 - Creer une demande de cotation

- Champ / donnee : objet de la demande, type, montant estime
- Source : saisie utilisateur
- Caractere obligatoire : oui
- Remarque : certains champs dependent du type d appel d offres

### Action 2 - Associer un client et une date limite

- Champ / donnee : client, date limite, contact
- Source : saisie utilisateur
- Caractere obligatoire : oui pour client et date limite
- Remarque : client doit etre actif

## Traitement systeme

### Action 1 - Creer une demande de cotation

1. Verifier les droits.
2. Verifier les champs obligatoires.
3. Generer une reference unique.
4. Creer la demande avec statut Brouillon ou Ouverte.
5. Historiser la creation.

### Action 2 - Associer un client et une date limite

1. Verifier les droits de modification.
2. Verifier l existence et l activite du client.
3. Enregistrer les informations.
4. Mettre a jour le statut si applicable.

## Output

### Action 1 - Creer une demande de cotation

- Resultat visible : demande creee avec reference
- Statut affiche : Brouillon ou Ouverte
- Trace creee : historique de creation
- Notification eventuelle : none

### Action 2 - Associer un client et une date limite

- Resultat visible : client et date limite affiches
- Statut affiche : mis a jour si applicable
- Trace creee : historique de modification
- Notification eventuelle : none

## Regle metier

### Action 1 - Creer une demande de cotation

- Une demande de cotation doit etre rattachee a un client avant passage en etude.

### Action 2 - Associer un client et une date limite

- La date limite sert de reference pour le suivi du dossier.

## Exception

### Action 1 - Creer une demande de cotation

- Cas : champs obligatoires manquants ; Effet attendu : blocage et message.
- Cas : utilisateur non autorise ; Effet attendu : action refusee.

### Action 2 - Associer un client et une date limite

- Cas : client inactif ; Effet attendu : blocage.

## Liens documentaires

- Relation -> [matrices/02-avant-vente.md](../../matrices/02-avant-vente.md) : cadrage de la demande de cotation et du passage vers l'offre.
- Relation -> [use-cases.md](../../use-cases.md) : cas d'usage de création d'une demande de cotation.
- Relation -> [user-stories.md](../../user-stories.md) : attente métier de création d'une demande d'offre structurée.
- Relation -> [permissions.md](../../permissions.md) : profils autorisés à créer, consulter et qualifier une demande de cotation.
- Relation -> [edge-cases.md](../../edge-cases.md) : client inactif, demande incomplète, doublon de cotation.

## Liens inter-modules

- Relation -> [../01-referentiel/01-tiers.md](../01-referentiel/01-tiers.md) : la demande de cotation dépend du client référentiel actif.
- Relation -> [../01-referentiel/02-articles-prestations.md](../01-referentiel/02-articles-prestations.md) : les articles et prestations alimentent la demande de cotation.
- Relation -> [../03-contrats-affaires-projets/01-transformation-offre-contrat-projet.md](../03-contrats-affaires-projets/01-transformation-offre-contrat-projet.md) : la cotation nourrit la transformation offre -> contrat -> projet.
