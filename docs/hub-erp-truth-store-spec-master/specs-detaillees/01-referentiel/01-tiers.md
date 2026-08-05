# Referentiel - Tiers (clients / fournisseurs)

## Perimetre

Creation et mise a jour des fiches clients et fournisseurs, base du reste des modules.

## Ecran / action

### Action 1 - Creer un client

- Ecran : Referentiel > Clients > Creer
- Action : Enregistrer la fiche client

### Action 2 - Creer un fournisseur

- Ecran : Referentiel > Fournisseurs > Creer
- Action : Enregistrer la fiche fournisseur

### Action 3 - Modifier un tiers

- Ecran : Referentiel > Clients/Fournisseurs > Fiche
- Action : Enregistrer les modifications

## Input

### Action 1 - Creer un client

- Champ / donnee : raison sociale, categorie, identifiant fiscal, contact principal
- Source : saisie utilisateur
- Caractere obligatoire : oui pour raison sociale et categorie
- Remarque : le client peut etre rattache a une affaire existante si le modele le demande

### Action 2 - Creer un fournisseur

- Champ / donnee : raison sociale, categorie fournisseur, contact principal, conditions
- Source : saisie utilisateur
- Caractere obligatoire : oui pour raison sociale
- Remarque : certains champs peuvent etre optionnels selon politique achats

### Action 3 - Modifier un tiers

- Champ / donnee : champs modifiables de la fiche
- Source : saisie utilisateur
- Caractere obligatoire : controle des champs obligatoires toujours applique
- Remarque : les modifications doivent etre historisees

## Traitement systeme

### Action 1 - Creer un client

1. Verifier les droits de creation.
2. Verifier les champs obligatoires.
3. Verifier l unicite minimale (raison sociale proche).
4. Generer une reference unique.
5. Creer la fiche et historiser la creation.

### Action 2 - Creer un fournisseur

1. Verifier les droits de creation.
2. Verifier les champs obligatoires.
3. Verifier l unicite minimale.
4. Generer une reference unique.
5. Creer la fiche et historiser la creation.

### Action 3 - Modifier un tiers

1. Verifier les droits de modification.
2. Verifier la validite des champs modifies.
3. Mettre a jour la fiche.
4. Enregistrer l historique de modification.

## Output

### Action 1 - Creer un client

- Resultat visible : fiche client creee
- Statut affiche : Actif
- Trace creee : historique de creation
- Notification eventuelle : none par defaut

### Action 2 - Creer un fournisseur

- Resultat visible : fiche fournisseur creee
- Statut affiche : Actif
- Trace creee : historique de creation
- Notification eventuelle : none par defaut

### Action 3 - Modifier un tiers

- Resultat visible : fiche mise a jour
- Statut affiche : inchangé
- Trace creee : historique de modification
- Notification eventuelle : none par defaut

## Regle metier

### Action 1 - Creer un client

- Toute fiche client doit avoir un identifiant unique.
- Un client inactif ne doit pas etre selectionnable dans les nouveaux flux.

### Action 2 - Creer un fournisseur

- Toute fiche fournisseur doit avoir un identifiant unique.

### Action 3 - Modifier un tiers

- Une fiche utilisee dans des transactions historiques ne doit pas etre supprimee.

## Exception

### Action 1 - Creer un client

- Cas : client deja existant ou tres similaire ; Effet attendu : alerte et blocage ou confirmation.
- Cas : utilisateur non autorise ; Effet attendu : action refusee.

### Action 2 - Creer un fournisseur

- Cas : doublon detecte ; Effet attendu : alerte et blocage ou confirmation.

### Action 3 - Modifier un tiers

- Cas : champ obligatoire supprime ; Effet attendu : erreur de validation.

## Liens documentaires

- Relation -> [matrices/01-referentiel.md](../../matrices/01-referentiel.md) : synthèse des règles, permissions et cas d'usage des tiers.
- Relation -> [use-cases.md](../../use-cases.md) : création, modification et désactivation des clients et fournisseurs.
- Relation -> [user-stories.md](../../user-stories.md) : besoins métiers d'administration des tiers.
- Relation -> [permissions.md](../../permissions.md) : profils autorisés à créer, modifier ou consulter les tiers.
- Relation -> [edge-cases.md](../../edge-cases.md) : doublons, fusion et désactivation d'un tiers encore utilisé.

## Liens inter-modules

- Relation -> [../02-avant-vente/01-demande-de-cotation.md](../02-avant-vente/01-demande-de-cotation.md) : une demande de cotation démarre à partir d'un client actif.
- Relation -> [../03-contrats-affaires-projets/01-transformation-offre-contrat-projet.md](../03-contrats-affaires-projets/01-transformation-offre-contrat-projet.md) : le client constitue la base de transformation offre -> contrat -> projet.
- Relation -> [../05-achats/03-consultation-fournisseurs-commandes.md](../05-achats/03-consultation-fournisseurs-commandes.md) : les fournisseurs référentiels sont sélectionnés pour les consultations et commandes.
