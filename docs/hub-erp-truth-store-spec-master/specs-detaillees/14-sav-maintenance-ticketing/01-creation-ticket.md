# SAV / Maintenance / Ticketing - Création du ticket

## Périmètre

Enregistrer un incident SAV, le qualifier et le prioriser selon les SLA et le contexte contractuel.

## Écran / action

### Action 1 - Créer un ticket

- Écran : Formulaire de ticket SAV
- Action : Enregistrer le ticket

### Action 2 - Qualifier et prioriser

- Écran : Fiche ticket
- Action : Qualifier, définir priorité et SLA

## Input

### Action 1 - Créer un ticket

- Champ / donnée : client, site, catégorie, description, pièces jointes
- Source : support ou portail client
- Caractère obligatoire : client, site, catégorie, description
- Remarque : la base installée doit être consultable

### Action 2 - Qualifier et prioriser

- Champ / donnée : priorité, SLA, symptôme, impact
- Source : support ou superviseur SAV
- Caractère obligatoire : priorité, SLA si contrat actif
- Remarque : possibilité d'affecter un technicien

## Traitement système

### Action 1 - Créer un ticket

1. Vérifier droits et existence du client et du site.
2. Générer une référence unique de ticket.
3. Enregistrer le ticket avec statut "Nouveau".
4. Lier le ticket au site et au contrat si applicable.
5. Tracer la création et les pièces jointes.

### Action 2 - Qualifier et prioriser

1. Vérifier l'éligibilité du ticket au SLA.
2. Enregistrer la priorité et les délais de prise en charge.
3. Mettre à jour le statut en "Qualifié" ou "Affecté".
4. Notifier les acteurs concernés si requis.
5. Historiser les décisions de qualification.

## Output

### Action 1 - Créer un ticket

- Résultat visible : ticket créé avec référence
- Statut affiché : Nouveau
- Trace créée : historique de création
- Notification éventuelle : confirmation au support ou au client

### Action 2 - Qualifier et prioriser

- Résultat visible : ticket qualifié et priorisé
- Statut affiché : Qualifié / Affecté
- Trace créée : historique de qualification
- Notification éventuelle : alerte au technicien affecté

## Règle métier

### Action 1 - Créer un ticket

- Tout ticket doit être rattaché à un client et à un site.
- La consultation de l'historique site est requise pour l'instruction.

### Action 2 - Qualifier et prioriser

- Tout ticket doit avoir une catégorie, une priorité et un SLA si le service est contractuellement encadré.
- Un ticket peut générer un ordre d'intervention selon le diagnostic.

## Exception

### Action 1 - Créer un ticket

- Cas : site inexistant ou inactif
  Effet attendu : blocage avec message d'erreur
- Cas : ticket dupliqué pour le même incident
  Effet attendu : alerte et proposition de fusion

### Action 2 - Qualifier et prioriser

- Cas : ticket hors périmètre contractuel
  Effet attendu : marquage "Hors périmètre" et consignes
- Cas : priorité haute sans ressource disponible
  Effet attendu : escalade et notification de retard
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module SAV / Maintenance / Ticketing
- Relation -> [Matrice 14-sav-maintenance-ticketing.md](../../matrices/14-sav-maintenance-ticketing.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [01-creation-planification-ot.md](../../07-execution-terrain-ordres-de-travail/01-creation-planification-ot.md) : le ticket peut être converti en ordre de travail planifié
- Relation -> [01-vue-360-projet.md](../../18-vue-transverse-affaire-projet/01-vue-360-projet.md) : le ticket doit apparaître dans la vue projet consolidée
- Relation -> [01-circuits-validation.md](../../16-gouvernance-validation-controle-interne/01-circuits-validation.md) : la priorisation et l’escalade peuvent être soumises à validation interne

