# Facturation - Facturation par origine

## Périmètre

Créer une facture à partir d'un PV validé ou d'une situation validée.

## Écran / action

### Action 1 - Créer une facture depuis un PV

- Écran : Facturation / Nouvelle facture
- Action : Sélectionner un PV et créer

### Action 2 - Créer une facture depuis une situation

- Écran : Facturation / Nouvelle facture
- Action : Sélectionner une situation et créer

## Input

### Action 1 - Créer une facture depuis un PV

- Champ / donnée : PV validé, client, projet/affaire, taxes
- Source : sélection utilisateur
- Caractère obligatoire : PV, client
- Remarque : PV signé requis si contrat l'exige

### Action 2 - Créer une facture depuis une situation

- Champ / donnée : situation validée, client, projet/affaire, taxes
- Source : sélection utilisateur
- Caractère obligatoire : situation, client
- Remarque : situation issue d'attachements validés

## Traitement système

### Action 1 - Créer une facture depuis un PV

1. Vérifier les droits de facturation.
2. Vérifier la validité et la signature du PV.
3. Générer la facture et ses lignes.
4. Rattacher la facture au client et au projet/affaire.
5. Mettre le statut à "brouillon" ou "à valider".

### Action 2 - Créer une facture depuis une situation

1. Vérifier la validité de la situation.
2. Calculer le net à facturer à partir de la situation.
3. Générer la facture et ses lignes.
4. Rattacher la facture au client et au projet/affaire.
5. Mettre le statut à "brouillon" ou "à valider".

## Output

### Action 1 - Créer une facture depuis un PV

- Résultat visible : facture créée
- Statut affiché : brouillon / à valider
- Trace créée : lien facture-PV
- Notification éventuelle : information aux acteurs

### Action 2 - Créer une facture depuis une situation

- Résultat visible : facture créée
- Statut affiché : brouillon / à valider
- Trace créée : lien facture-situation
- Notification éventuelle : information aux acteurs

## Règle métier

### Action 1 - Créer une facture depuis un PV

- Règle 1 : aucune facture ne doit être émise sans preuve d'exécution lorsque le mode l'exige.
- Règle 2 : toute facture doit être rattachée à un client et à un projet/affaire.

### Action 2 - Créer une facture depuis une situation

- Règle 1 : la facture BTP doit être basée sur une situation validée.
- Règle 2 : une facture annulée ou corrigée doit conserver sa traçabilité.

## Exception

### Action 1 - Créer une facture depuis un PV

- Cas : PV avec réserves majeures
  Effet attendu : blocage ou avertissement selon politique.
- Cas : PV non signé
  Effet attendu : facturation bloquée.

### Action 2 - Créer une facture depuis une situation

- Cas : situation rejetée ou corrigée
  Effet attendu : création bloquée ou facture marquée provisoire.
- Cas : situation partielle
  Effet attendu : facture partielle indiquée.

## Liens documentaires

- Relation -> [README du module](./README.md) : rattache cette fiche au module facturation.
- Relation -> [Matrice du module](../../matrices/12-facturation.md) : relie les origines de facture aux règles consolidées.
- Relation -> [use-cases.md](../../use-cases.md) : source des cas de création de facture depuis preuves ou situations.
- Relation -> [business-rules.md](../../business-rules.md) : précise les conditions de rattachement client/projet et de signature PV.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit le passage brouillon -> à valider.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les PV avec réserves, les situations partielles et les créations bloquées.

## Liens inter-modules

- Relation -> [08-pv-preuves-de-realisation/03-pv-base-facturation.md](../08-pv-preuves-de-realisation/03-pv-base-facturation.md) : un PV validé ou facturable sert de source à la facture.
- Relation -> [11-btp-avancement-attachements-situations/02-situation-validation.md](../11-btp-avancement-attachements-situations/02-situation-validation.md) : une situation validée devient base de facture BTP.
- Relation -> [13-encaissement-recouvrement/01-encaissement-client.md](../13-encaissement-recouvrement/01-encaissement-client.md) : la facture créée passe ensuite au cycle d'encaissement.
