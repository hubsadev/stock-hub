# Guide Agent — `spec-truth`

## Vue d'ensemble

Ce dossier contient une base de vérité fonctionnelle pour un ERP centré sur le `projet`, avec l'`affaire` comme éventuel conteneur contractuel ou analytique.
Les documents couvrent 18 modules métier et suivent une progression logique:

1. `1-a` Problèmes / objectifs
2. `2-a` Use cases
3. `2-b` User stories
4. `3-a` Functional requirements
5. `3-b` Acceptance criteria
6. `3-c` Business rules
7. `3-d` Permissions
8. `3-e` State transitions
9. `3-f` Edge cases
10. `4` User flows

La structure est cohérente d'un fichier à l'autre: mêmes modules, même logique métier, même idée directrice.
L'objet transverse principal est le `projet`, qui relie avant-vente, contrat, budget, achats, stock, exécution, facturation, encaissement et maintenance.

## Ordre de lecture recommandé

1. [problems-goals.md](./problems-goals.md)
2. [use-cases.md](./use-cases.md)
3. [user-stories.md](./user-stories.md)
4. [functionnal-requirements.md](./functionnal-requirements.md)
5. [acceptance-criteria.md](./acceptance-criteria.md)
6. [business-rules.md](./business-rules.md)
7. [permissions.md](./permissions.md)
8. [state-transitions.md](./state-transitions.md)
9. [edge-cases.md](./edge-cases.md)
10. [user-flows.md](./user-flows.md)

## Cartographie des fichiers

| Fichier | Rôle | Contenu principal | Dépend surtout de | Alimente surtout |
| --- | --- | --- | --- | --- |
| [problems-goals.md](./problems-goals.md) | Cadrage stratégique | Les problèmes métier et objectifs ERP, module par module, du référentiel jusqu'à la vision globale | Rien, c'est la source amont | [use-cases.md](./use-cases.md), [user-stories.md](./user-stories.md), [functionnal-requirements.md](./functionnal-requirements.md) |
| [use-cases.md](./use-cases.md) | Cadrage fonctionnel orienté actions | Les actions attendues par module: créer, valider, transformer, affecter, clôturer, facturer, etc. | [problems-goals.md](./problems-goals.md) | [user-stories.md](./user-stories.md), [functionnal-requirements.md](./functionnal-requirements.md), [user-flows.md](./user-flows.md) |
| [user-stories.md](./user-stories.md) | Cadrage orienté rôles et besoins utilisateurs | Les besoins formulés en "En tant que...", par rôle métier et par module | [problems-goals.md](./problems-goals.md), [use-cases.md](./use-cases.md) | [functionnal-requirements.md](./functionnal-requirements.md), [permissions.md](./permissions.md), [acceptance-criteria.md](./acceptance-criteria.md) |
| [functionnal-requirements.md](./functionnal-requirements.md) | Noyau de la spécification fonctionnelle | Les capacités que le système doit offrir, formulées en exigences système | [use-cases.md](./use-cases.md), [user-stories.md](./user-stories.md) | [acceptance-criteria.md](./acceptance-criteria.md), [business-rules.md](./business-rules.md), [permissions.md](./permissions.md), [state-transitions.md](./state-transitions.md), [edge-cases.md](./edge-cases.md), [user-flows.md](./user-flows.md) |
| [acceptance-criteria.md](./acceptance-criteria.md) | Validation testable | Les critères d'acceptation formulés de façon vérifiable, souvent en Given/When/Then | [functionnal-requirements.md](./functionnal-requirements.md), [business-rules.md](./business-rules.md), [state-transitions.md](./state-transitions.md) | Recette fonctionnelle, QA, validation métier, [user-flows.md](./user-flows.md) |
| [business-rules.md](./business-rules.md) | Contraintes métier | Les règles non négociables: validations, traçabilité, non-duplication, conditions de facturation, rattachements obligatoires | [problems-goals.md](./problems-goals.md), [functionnal-requirements.md](./functionnal-requirements.md) | [acceptance-criteria.md](./acceptance-criteria.md), [permissions.md](./permissions.md), [state-transitions.md](./state-transitions.md), [edge-cases.md](./edge-cases.md), [user-flows.md](./user-flows.md) |
| [permissions.md](./permissions.md) | Gouvernance par rôle | Les droits de consultation, création, modification, validation et supervision par rôle métier et par module | [user-stories.md](./user-stories.md), [business-rules.md](./business-rules.md), [functionnal-requirements.md](./functionnal-requirements.md) | Design des rôles, sécurité applicative, [user-flows.md](./user-flows.md), [acceptance-criteria.md](./acceptance-criteria.md) |
| [state-transitions.md](./state-transitions.md) | Cycles de vie métier | Les états et transitions des objets principaux: demande de cotation, offre, budget, DA, OT, PV, facture, ticket, etc. | [business-rules.md](./business-rules.md), [functionnal-requirements.md](./functionnal-requirements.md) | [acceptance-criteria.md](./acceptance-criteria.md), [edge-cases.md](./edge-cases.md), [user-flows.md](./user-flows.md) |
| [edge-cases.md](./edge-cases.md) | Robustesse et exceptions | Les cas limites, cas de bord et anomalies métier à prévoir par module | [functionnal-requirements.md](./functionnal-requirements.md), [business-rules.md](./business-rules.md), [state-transitions.md](./state-transitions.md) | Durcissement des specs, QA, [acceptance-criteria.md](./acceptance-criteria.md), [user-flows.md](./user-flows.md) |
| [user-flows.md](./user-flows.md) | Vue procédurale et end-to-end | Les parcours pas à pas, par module puis par grands processus de bout en bout | Tous les documents précédents | Référence de conception, onboarding, maquettage, implémentation |

## Description détaillée par fichier

### [problems-goals.md](./problems-goals.md)

Point d'entrée stratégique du dossier.
Le document explique pourquoi chaque module existe et quel problème opérationnel il doit résoudre.
Il pose aussi les grands invariants métier:

- centralisation du référentiel
- pilotage par l'affaire
- traçabilité de bout en bout
- lien entre exécution, preuve, facturation et encaissement

Sans ce fichier, les autres documents perdent leur justification métier.

### [use-cases.md](./use-cases.md)

Version actionnelle des objectifs.
Chaque module est traduit en actions observables du système ou de l'utilisateur: créer, transformer, calculer, soumettre, valider, affecter, clôturer.
Ce fichier sert de pont entre la stratégie et la spécification détaillée.

### [user-stories.md](./user-stories.md)

Version orientée utilisateur des besoins.
Le document rend explicites les rôles métier: direction, chef de projet, magasinier, technicien, comptable, support, achats et contrôle.
Il est utile pour comprendre:

- qui agit
- pourquoi il agit
- quelle valeur métier est recherchée

### [functionnal-requirements.md](./functionnal-requirements.md)

Le coeur prescriptif du dossier.
Il reformule les besoins en capacités système attendues, sans encore détailler le test ni les cas limites.
C'est le meilleur fichier pour dériver:

- backlog produit
- découpage fonctionnel
- conception de modules
- spécification ERPNext

### [acceptance-criteria.md](./acceptance-criteria.md)

Le fichier de testabilité.
Chaque besoin important y est reformulé en comportement vérifiable.
Il permet de savoir si une implémentation remplit réellement l'intention du besoin.
C'est la couche la plus proche de la recette fonctionnelle.

### [business-rules.md](./business-rules.md)

Le fichier des contraintes métier transverses.
Il fixe ce qui est autorisé, interdit ou conditionné: validation préalable, unicité, historisation, liens obligatoires, non-réutilisation abusive, règles de facturabilité, etc.
Il structure fortement:

- les validations
- les statuts
- les contrôles bloquants

### [permissions.md](./permissions.md)

Le modèle d'autorisation métier.
Il définit qui peut voir, créer, modifier, valider ou superviser quoi, module par module.
Ce document ne décrit pas les workflows eux-mêmes, mais il conditionne leur exécution réelle.
Il est indispensable pour mapper les rôles ERPNext.

### [state-transitions.md](./state-transitions.md)

Le modèle de cycle de vie des objets.
Il couvre les objets structurants de l'ERP:

- objets de référentiel
- demandes de cotation et offres
- contrats et affaires
- budgets
- demandes d'achat et commandes
- OT, PV, pointages
- situations, factures, encaissements
- tickets, activités planifiées, validations, snapshots KPI

Il donne la colonne vertébrale des statuts métier.

### [edge-cases.md](./edge-cases.md)

Le fichier de robustesse.
Il liste les situations imparfaites ou ambiguës que le système devra absorber:

- doublons
- données incohérentes
- validations incomplètes
- réceptions partielles
- OT corrigés en cours de route
- litiges client
- multi-fournisseurs
- cas de facturation mixte

C'est un excellent support pour éviter une spécification trop "idéale".

### [user-flows.md](./user-flows.md)

Le document de synthèse procédurale.
Il rassemble:

- des user flows par module
- des flows bout en bout par grands processus métier

Ce fichier est celui qui montre le mieux l'enchaînement global du système, de l'avant-vente jusqu'au SAV et au recouvrement.

## Liens entre les fichiers

### Chaîne documentaire principale

```text
problems-goals
  -> use-cases
  -> user-stories
      -> functionnal-requirements
          -> acceptance-criteria
          -> business-rules
          -> permissions
          -> state-transitions
          -> edge-cases
              -> user-flows
```

### Liens forts à retenir

- [problems-goals.md](./problems-goals.md) est la source de sens métier.
- [use-cases.md](./use-cases.md) et [user-stories.md](./user-stories.md) sont les deux ponts entre stratégie et spécification.
- [functionnal-requirements.md](./functionnal-requirements.md) est le pivot central du dossier.
- [business-rules.md](./business-rules.md), [permissions.md](./permissions.md) et [state-transitions.md](./state-transitions.md) doivent rester synchronisés.
- [acceptance-criteria.md](./acceptance-criteria.md) et [edge-cases.md](./edge-cases.md) servent à tester la qualité réelle des exigences.
- [user-flows.md](./user-flows.md) synthétise et met en scène l'ensemble.

### Lien transverse métier principal

Le lien conceptuel le plus important du dossier est le `projet`.
Elle sert de noeud de rattachement entre:

- la demande de cotation, l'offre retenue et le contrat
- le budget
- les achats et le stock
- les ordres de travail et les PV
- l'avancement chantier
- la facturation et l'encaissement
- la maintenance et les tickets
- le reporting global

Autrement dit, si un futur agent doit comprendre le modèle métier rapidement, il doit partir de:

1. [problems-goals.md](./problems-goals.md)
2. [functionnal-requirements.md](./functionnal-requirements.md)
3. [state-transitions.md](./state-transitions.md)
4. [user-flows.md](./user-flows.md)

## Convention implicite du dossier

- Tous les fichiers reprennent les mêmes 18 modules.
- La hiérarchie des niveaux est stable d'un document à l'autre.
- Le dossier est pensé comme une suite de transformation: besoin -> capacité -> règle -> validation -> parcours.
- Les fichiers sont rédigés comme des livrables de cadrage fonctionnel, pas comme de la documentation technique d'implémentation.

## Usage conseillé pour un agent

- Utiliser [problems-goals.md](./problems-goals.md) pour comprendre l'intention métier.
- Utiliser [functionnal-requirements.md](./functionnal-requirements.md) comme base de traduction en objets ERPNext ou en backlog.
- Utiliser [business-rules.md](./business-rules.md), [permissions.md](./permissions.md) et [state-transitions.md](./state-transitions.md) pour définir les contrôles et les statuts.
- Utiliser [acceptance-criteria.md](./acceptance-criteria.md) et [edge-cases.md](./edge-cases.md) pour vérifier qu'une implémentation n'est pas incomplète.
- Utiliser [user-flows.md](./user-flows.md) pour reconstruire les scénarios bout en bout.
