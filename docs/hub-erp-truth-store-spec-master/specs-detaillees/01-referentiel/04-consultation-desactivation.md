# Referentiel - Consultation et desactivation

## Perimetre

Consultation des fiches et desactivation logique sans perte d historique.

## Ecran / action

### Action 1 - Consulter une fiche

- Ecran : Referentiel > Liste > Fiche
- Action : Ouvrir la fiche complete

### Action 2 - Desactiver un objet

- Ecran : Referentiel > Fiche
- Action : Desactiver

### Action 3 - Reactiver un objet

- Ecran : Referentiel > Fiche
- Action : Reactiver

## Input

### Action 1 - Consulter une fiche

- Champ / donnee : identifiant objet
- Source : selection utilisateur
- Caractere obligatoire : oui
- Remarque : controle des droits de consultation

### Action 2 - Desactiver un objet

- Champ / donnee : motif de desactivation (optionnel)
- Source : saisie utilisateur
- Caractere obligatoire : non
- Remarque : objet peut etre utilise historiquement

### Action 3 - Reactiver un objet

- Champ / donnee : confirmation
- Source : action utilisateur
- Caractere obligatoire : oui
- Remarque : objet doit etre desactive

## Traitement systeme

### Action 1 - Consulter une fiche

1. Verifier les droits de consultation.
2. Charger la fiche et l historique.

### Action 2 - Desactiver un objet

1. Verifier les droits.
2. Verifier que l objet existe.
3. Basculer le statut en Inactif.
4. Conserver la tracabilite des usages historiques.
5. Historiser l action.

### Action 3 - Reactiver un objet

1. Verifier les droits.
2. Verifier que l objet est desactive.
3. Basculer le statut en Actif.
4. Historiser l action.

## Output

### Action 1 - Consulter une fiche

- Resultat visible : fiche complete et historique
- Statut affiche : statut courant
- Trace creee : none
- Notification eventuelle : none

### Action 2 - Desactiver un objet

- Resultat visible : statut Inactif
- Statut affiche : Inactif
- Trace creee : historique de desactivation
- Notification eventuelle : none

### Action 3 - Reactiver un objet

- Resultat visible : statut Actif
- Statut affiche : Actif
- Trace creee : historique de reactivation
- Notification eventuelle : none

## Regle metier

### Action 2 - Desactiver un objet

- Un objet inactif ne doit plus etre selectionnable pour de nouvelles operations.
- Un objet utilise historiquement ne doit pas etre supprime physiquement.

### Action 3 - Reactiver un objet

- La reactivation ne doit pas alterer l historique.

## Exception

### Action 1 - Consulter une fiche

- Cas : utilisateur non autorise ; Effet attendu : acces refuse.

### Action 2 - Desactiver un objet

- Cas : objet deja inactif ; Effet attendu : message informatif.
- Cas : objet inexistant ; Effet attendu : erreur.

### Action 3 - Reactiver un objet

- Cas : objet actif ; Effet attendu : message informatif.

## Liens documentaires

- Relation -> [matrices/01-referentiel.md](../../matrices/01-referentiel.md) : règles de consultation et de désactivation des objets référentiels.
- Relation -> [permissions.md](../../permissions.md) : droits requis pour consulter ou désactiver un objet.
- Relation -> [state-transitions.md](../../state-transitions.md) : passage des états actif, inactif et archivé.
- Relation -> [edge-cases.md](../../edge-cases.md) : objets encore utilisés, objets déjà historisés et désactivation contrôlée.
- Relation -> [user-flows.md](../../user-flows.md) : parcours de consultation et de désactivation sans rupture d'historique.

## Liens inter-modules

- Relation -> [../02-avant-vente/01-demande-de-cotation.md](../02-avant-vente/01-demande-de-cotation.md) : la consultation du client actif conditionne l'ouverture d'une cotation.
- Relation -> [../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md](../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md) : la vue consolidée s'appuie sur les référentiels actifs.
- Relation -> [../05-achats/01-expression-de-besoin.md](../05-achats/01-expression-de-besoin.md) : l'affectation de besoin dépend d'objets référentiels toujours sélectionnables.
- Relation -> [../06-stock-logistique-magasin/04-pilotage-stock.md](../06-stock-logistique-magasin/04-pilotage-stock.md) : le pilotage du stock dépend des emplacements et ressources actifs.
