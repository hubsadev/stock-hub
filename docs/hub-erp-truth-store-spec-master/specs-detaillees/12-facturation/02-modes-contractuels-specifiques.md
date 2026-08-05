# Facturation - Modes contractuels spécifiques

## Périmètre

Créer une facture selon le mode contractuel : forfait, intervention, site installé, fourniture, maintenance/SAV facturable.

## Écran / action

### Action 1 - Créer une facture selon le mode contractuel

- Écran : Facturation / Nouvelle facture
- Action : Choisir le mode et générer

## Input

### Action 1 - Créer une facture selon le mode contractuel

- Champ / donnée : contrat, mode de facturation, période, éléments facturables
- Source : sélection utilisateur
- Caractère obligatoire : contrat, mode
- Remarque : dépend des clauses contractuelles

## Traitement système

### Action 1 - Créer une facture selon le mode contractuel

1. Vérifier le mode de facturation autorisé par le contrat.
2. Identifier les éléments facturables selon le mode (site, intervention, forfait, fourniture, maintenance).
3. Exclure les interventions couvertes par garantie/maintenance incluse.
4. Générer les lignes de facture et les rattachements.
5. Mettre le statut à "brouillon" ou "à valider".

## Output

### Action 1 - Créer une facture selon le mode contractuel

- Résultat visible : facture créée avec lignes adaptées
- Statut affiché : brouillon / à valider
- Trace créée : lien facture-contrat et justificatifs
- Notification éventuelle : information aux parties

## Règle métier

### Action 1 - Créer une facture selon le mode contractuel

- Règle 1 : la base de facturation dépend du contrat : PV, situation, forfait, intervention, site installé, fourniture, maintenance facturable.
- Règle 2 : une intervention couverte par maintenance incluse n'est pas facturée à l'unité.

## Exception

### Action 1 - Créer une facture selon le mode contractuel

- Cas : mode de facturation non prévu au contrat
  Effet attendu : action bloquée.
- Cas : projet en facturation mixte
  Effet attendu : facture générée par mode, sans doublon.

## Liens documentaires

- Relation -> [README du module](./README.md) : situe les modes contractuels dans le module facturation.
- Relation -> [Matrice du module](../../matrices/12-facturation.md) : consolide les modes, les bases et les exceptions de facturation.
- Relation -> [business-rules.md](../../business-rules.md) : formalise les exclusions de garantie et les bases autorisées.
- Relation -> [permissions.md](../../permissions.md) : borne les droits de création selon le contrat.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les cas de mix contractuel et de mode absent.

## Liens inter-modules

- Relation -> [07-execution-terrain-ordres-de-travail/03-anomalies-cloture-ot.md](../07-execution-terrain-ordres-de-travail/03-anomalies-cloture-ot.md) : le mode intervention dépend de la clôture technique de l'OT.
- Relation -> [08-pv-preuves-de-realisation/03-pv-base-facturation.md](../08-pv-preuves-de-realisation/03-pv-base-facturation.md) : le mode basé sur PV se nourrit du PV signé et validé.
- Relation -> [11-btp-avancement-attachements-situations/02-situation-validation.md](../11-btp-avancement-attachements-situations/02-situation-validation.md) : le mode BTP s'appuie sur la situation validée.
- Relation -> [14-sav-maintenance-ticketing/03-cloture-facturabilite.md](../14-sav-maintenance-ticketing/03-cloture-facturabilite.md) : le mode maintenance/SAV s'aligne sur la clôture facturable du ticket ou de l'intervention.
