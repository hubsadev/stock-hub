# Vue transverse Affaire / Projet - Navigation transverse

## Périmètre

Navigation entre les objets lies au projet et acces aux details par module.

## Écran / action

### Action 1 - Naviguer vers un objet lie

- Écran : Fiche projet - Vue 360
- Action : Cliquer sur un lien d'objet (offre, OT, PV, facture, ticket)

### Action 2 - Filtrer la liste des objets lies

- Écran : Fiche projet - Vue 360
- Action : Appliquer un filtre (periode, type, statut)

## Input

### Action 1 - Naviguer vers un objet lie

- Champ / donnée : Identifiant de l'objet ; Source : systeme ; Caractère obligatoire : oui ; Remarque : lien issu du projet.

### Action 2 - Filtrer la liste des objets lies

- Champ / donnée : Periode ; Source : utilisateur habilité ; Caractère obligatoire : non ; Remarque : mois, trimestre, cumul.
- Champ / donnée : Statut ; Source : utilisateur habilité ; Caractère obligatoire : non ; Remarque : selon le module cible.

## Traitement système

### Action 1 - Naviguer vers un objet lie

1. Vérifier les droits sur le module cible.
2. Charger la fiche detaillee de l'objet.
3. Afficher le contexte projet et l'historique.

### Action 2 - Filtrer la liste des objets lies

1. Valider les filtres.
2. Recharger les listes d'objets lies.
3. Mettre a jour les compteurs par statut.

## Output

### Action 1 - Naviguer vers un objet lie

- Résultat visible : Fiche detaillee de l'objet.
- Statut affiché : Statut de l'objet.
- Trace créée : Aucune.
- Notification éventuelle : Aucune.

### Action 2 - Filtrer la liste des objets lies

- Résultat visible : Liste filtree.
- Statut affiché : Filtres actifs visibles.
- Trace créée : Aucune.
- Notification éventuelle : Aucune.

## Règle métier

### Action 1 - Naviguer vers un objet lie

- Règle 1 : Les objets lies a un projet restent navigables depuis la fiche projet.
- Règle 2 : Les droits par module s'appliquent.

### Action 2 - Filtrer la liste des objets lies

- Règle 1 : Les filtres n'autorisent que le perimetre accessible.
- Règle 2 : Les listes doivent rester coherentes avec les statuts officiels.

## Exception

### Action 1 - Naviguer vers un objet lie

- Cas : Objet supprime ou archive ; Effet attendu : message et retour a la liste.
- Cas : Droits insuffisants ; Effet attendu : acces refuse.

### Action 2 - Filtrer la liste des objets lies

- Cas : Filtre invalide ; Effet attendu : message d'erreur.
- Cas : Aucun resultat ; Effet attendu : affichage vide avec message.
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module Vue transverse Affaire / Projet
- Relation -> [Matrice 18-vue-transverse-affaire-projet.md](../../matrices/18-vue-transverse-affaire-projet.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [01-demande-de-cotation.md](../../02-avant-vente/01-demande-de-cotation.md) : la navigation transverse relie le besoin commercial initial au dossier projet
- Relation -> [03-consultation-fournisseurs-commandes.md](../../05-achats/03-consultation-fournisseurs-commandes.md) : le cockpit doit ouvrir les achats et commandes liés
- Relation -> [01-creation-planification-ot.md](../../07-execution-terrain-ordres-de-travail/01-creation-planification-ot.md) : les OT sont un volet clé de navigation depuis le projet
- Relation -> [03-consultation-correction-facture.md](../../12-facturation/03-consultation-correction-facture.md) : la navigation transverse doit permettre d’atteindre la facturation et ses corrections
- Relation -> [03-cloture-facturabilite.md](../../14-sav-maintenance-ticketing/03-cloture-facturabilite.md) : les clôtures SAV font partie des objets transverse à explorer

