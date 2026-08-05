Parfait. Voici le **3-c) Business rules**, toujours **module par module**, en restant strictement à ce niveau. J’évite de mélanger avec les permissions, les états, les edge cases ou les user flows. Les règles ci-dessous sont formulées comme des règles métier transverses et opérationnelles dérivées de ton exemple. 

# 3-c) Business rules

## Module 1 — Référentiel

1. Chaque objet de référence doit avoir un identifiant unique.
2. Un objet de référence inactif ne doit plus être utilisable dans de nouveaux enregistrements.
3. Un objet de référence déjà utilisé dans des transactions historiques ne doit pas être supprimé si cela casse la traçabilité.
4. Un article doit appartenir à une catégorie métier définie.
5. Un article peut être de type matériel ou prestation.
6. Un site doit être rattaché à un client ou à une affaire selon le modèle retenu.
7. Un dépôt doit être distingué des autres emplacements logistiques.
8. Les caractéristiques d’un article doivent permettre de différencier des variantes métier réellement distinctes.  

## Module 2 — Avant-vente

1. Aucune offre ne doit être envoyée au client sans validation technique préalable.
2. Toute offre doit être validée par la direction avant envoi.
3. Une offre peut avoir plusieurs versions, mais une seule version doit être considérée comme version courante active.
4. Toute version d’offre doit rester historisée.
5. Le taux de marge doit être calculé à partir du montant de vente et du coût estimé.
6. Une alerte doit être émise si la marge minimale attendue n’est pas atteinte, sur la base d’un seuil configurable, par défaut 25 %, sans blocage automatique du flux sauf règle complémentaire explicite.
7. Une demande de cotation peut donner lieu à plusieurs itérations d’étude et de chiffrage.
8. Une offre doit être qualifiée par un type documentaire explicite : devis ou facture proforma.
9. Une offre ne peut être marquée “retenue” qu’après décision explicite du client.
10. Une offre ne peut être marquée “infirmée” ou “sans suite” qu’après clôture commerciale du dossier. 

## Module 3 — Contrats / Affaires / Projets

1. Un projet ne peut être créé que si une offre a été retenue ou qu’un contrat a été signé, selon le processus retenu.
2. Un contrat peut générer un ou plusieurs projets.
3. Un projet doit être rattaché à un client.
4. Un projet doit être rattaché à un contrat lorsqu’il existe.
5. Un projet doit avoir un chef de projet identifié.
6. Un projet peut être découpé en plusieurs zones, sites ou sous-lots.
7. Toutes les opérations d’exécution, de coût, d’achat et de facturation doivent pouvoir être rattachées à un projet et, si besoin, à une affaire de rattachement.
8. Le projet constitue l’objet central de pilotage opérationnel de l’ERP.
9. Une zone, un site ou un chantier ne doit pas exister hors de son projet parent.  

## Module 4 — Budget / Pilotage financier projet

1. Un budget doit être validé avant le lancement des achats soumis à budget.
2. Chaque budget doit être rattaché à une affaire, un projet ou un centre de coût.
3. Un budget doit être structuré par postes de coût.
4. Une affaire peut avoir un budget initial et un ou plusieurs budgets révisés.
5. Le budget initial doit rester consultable après révision.
6. Le budget révisé ne doit pas écraser l’historique du budget initial.
7. Les dépenses réelles doivent être comparables au budget par poste.
8. La marge cible doit être définie au niveau de l’affaire ou projet concerné. 

## Module 5 — Achats

1. Toute demande d’achat doit provenir d’un besoin exprimé ou d’un besoin justifié.
2. Tout besoin doit d’abord être confronté au stock disponible avant de générer une demande d’achat.
3. Une demande d’achat ne doit porter que sur le besoin non couvert par le stock.
4. Tout achat doit être rattaché à un projet, une affaire ou un stock central.
5. Une demande d’achat doit suivre le circuit de validation défini avant engagement fournisseur, incluant la comptabilité, les achats, la direction stratégie et développement et la direction générale selon les seuils retenus.
6. Plusieurs fournisseurs peuvent être consultés pour un même besoin.
7. Plusieurs fournisseurs peuvent être retenus pour couvrir un même besoin.
8. Un même article peut être commandé chez plusieurs fournisseurs si cela est nécessaire pour couvrir la quantité requise.
9. Le comparatif des offres doit permettre d’évaluer au minimum prix, disponibilité et caractéristiques.
10. Une commande fournisseur ne peut porter que sur des lignes validées pour achat.
11. Une commande doit être traçable jusqu’au besoin d’origine.
12. Une prestation terrain sous-traitée peut être achetée sans générer de mouvement de stock, tout en restant rattachée au projet concerné. 

## Module 6 — Stock / Logistique / Magasin

1. La réception partielle doit être autorisée.
2. La réception totale doit clôturer les quantités attendues uniquement si toutes les lignes sont reçues.
3. Le stock doit distinguer plusieurs emplacements logistiques.
4. Une sortie de stock doit être rattachée à une destination métier identifiable.
5. Une sortie chantier ne doit pas être autorisée sans bon validé.
6. Le stock peut être réservé pour une affaire ou un projet.
7. Un stock réservé peut être réaffecté en urgence selon les règles de gestion définies, avec obligation de traçabilité et de restitution si applicable.
8. Le matériel transféré entre emplacements doit conserver sa traçabilité.
9. Le retour de matériel vers l’entrepôt doit être autorisé pour réintégration.
10. Certains équipements doivent être tracés par lot ou numéro de série.
11. Le stock doit permettre la gestion de seuil d’alerte, seuil de commande, stock de rotation et inventaire.
12. Un mouvement de stock ne doit jamais faire perdre l’historique d’origine et de destination. 

## Module 7 — Exécution terrain / Ordres de travail

1. Un ordre de travail doit être planifié sur une équipe interne ou un prestataire terrain avant exécution.
2. Un ordre de travail doit être rattaché à un site, chantier, projet, affaire ou ticket selon son origine.
3. Un ordre de travail peut couvrir des tâches d’installation, configuration, maintenance ou autre opération terrain.
4. Certaines tâches nécessitent des checklists obligatoires.
5. Toute intervention terrain doit pouvoir enregistrer le temps passé.
6. Toute intervention terrain doit pouvoir enregistrer les matériels consommés.
7. Toute intervention terrain doit pouvoir enregistrer des preuves d’exécution.
8. Une anomalie détectée sur le terrain doit être enregistrable même si elle n’est pas corrigée immédiatement.
9. Toute prestation réalisée par un prestataire ou fournisseur sur le terrain doit identifier l’intervenant et le coût associé afin de permettre son paiement.
10. Une intervention ne doit pas être considérée comme complètement documentée si ses éléments de preuve requis sont absents. 

## Module 8 — PV / Preuves de réalisation

1. Un PV doit être lié à une intervention, un OT ou une opération identifiable.
2. Un PV doit refléter les travaux effectivement réalisés.
3. Un PV peut contenir des réserves.
4. Un PV signé constitue une preuve d’exécution.
5. Un PV peut servir de base de facturation lorsque le contrat le prévoit.
6. Un PV doit conserver les pièces jointes et la preuve de signature associées.
7. Un PV avec réserves peut rester exploitable ou non pour facturation selon la politique métier retenue. 

## Module 9 — Temps / Ressources / Pointage

1. Chaque heure pointée doit être rattachée à une affaire, un OT, un chantier ou une tâche.
2. Le pointage doit distinguer heures normales et heures supplémentaires.
3. Le pointage doit être soumis à validation hiérarchique.
4. Les heures validées alimentent le coût réel du projet.
5. Les ressources non humaines utilisées sur le terrain doivent aussi pouvoir être imputées.
6. Le pointage constitue une source officielle de calcul du coût de main-d’œuvre et d’utilisation des moyens. 

## Module 10 — Coûts analytiques / Rentabilité

1. Le coût réel d’une affaire doit agréger au minimum main-d’œuvre, matériel consommé, sous-traitance, déplacement et moyens utilisés.
2. Le coût réel doit être calculable par intervention, site, chantier et affaire.
3. Les coûts réels doivent être comparables au budget.
4. La rentabilité doit pouvoir être mesurée par client, affaire ou site.
5. Le coût analytique dépend de la qualité des imputations de temps, matériel et ressources.
6. Toute composante de coût retenue dans le modèle doit être rattachée à un objet analytique identifiable. 

## Module 11 — BTP / Avancement / Attachements / Situations

1. Les quantités d’avancement doivent être saisies sur des unités d’œuvre pertinentes.
2. Les quantités doivent être validées par les acteurs prévus avant valorisation.
3. Un attachement doit servir de preuve des quantités réalisées.
4. Une situation mensuelle doit être basée sur des quantités validées.
5. La facture BTP doit être basée sur une situation validée.
6. Les retenues de garantie, acomptes, avances et pénalités doivent être pris en compte dans le calcul du net à facturer.
7. Les attachements et situations doivent rester historisés par période.
8. Une même quantité exécutée ne doit pas être valorisée plusieurs fois dans des situations différentes, sauf mécanisme métier explicite de correction. 

## Module 12 — Facturation

1. Aucune facture ne doit être émise sans preuve d’exécution lorsque le mode de facturation l’exige.
2. La base de facturation dépend du contrat : PV, situation, forfait, intervention, site installé, fourniture ou maintenance facturable.
3. Toute facture doit être rattachée à un client et à un projet ou une affaire, directement ou indirectement.
4. Une facture doit être traçable jusqu’à son justificatif d’origine.
5. Le reste à facturer doit être calculable à partir des éléments facturables non encore facturés.
6. Une facture annulée ou corrigée doit conserver sa traçabilité historique.  

## Module 13 — Encaissement / Recouvrement

1. Tout encaissement doit être rattachable à une ou plusieurs factures.
2. Le suivi des échéances doit permettre d’identifier les retards de paiement.
3. Les relances doivent être historisées.
4. Le montant restant dû doit être calculé à partir des montants facturés et encaissés.
5. Le recouvrement fait partie du cycle de vie financier d’une affaire ou d’un projet.

## Module 14 — SAV / Maintenance / Ticketing

1. Tout ticket doit être rattaché à un client et à un site.
2. Tout ticket doit avoir une catégorie, une priorité et un SLA si le service est contractuellement encadré.
3. L’historique du site et la base installée doivent être consultables pour instruire un incident.
4. Un ticket peut générer un ordre d’intervention.
5. La cause racine doit être enregistrable à la clôture.
6. Les pièces remplacées doivent être tracées.
7. La décision de facturabilité dépend du contrat, de la garantie et du périmètre de l’intervention.
8. Une intervention couverte par maintenance incluse n’est pas facturée à l’unité.
9. Une intervention hors périmètre ou hors garantie est facturable.
10. Une intervention de maintenance n’est pas présumée gratuite; sa facturabilité doit être explicitement déterminée.
11. Le respect du SLA doit être mesurable. 

## Module 15 — Planning / Coordination opérationnelle

1. Les activités planifiées doivent être rattachées à une affaire ou projet.
2. Les jalons doivent être suivables dans le temps.
3. Une activité peut être replanifiée en cas de contrainte ou de retard.
4. Les équipes affectées doivent être identifiables sur le planning.
5. Le planning doit soutenir la coordination entre approvisionnement, travaux, installation et maintenance.  

## Module 16 — Gouvernance / Validation / Contrôle interne

1. Les offres doivent suivre un circuit de validation défini.
2. Les budgets doivent suivre un circuit de validation défini.
3. Les demandes d’achat doivent suivre un circuit de validation défini.
4. Une action dépendante d’une validation préalable doit être bloquée tant que cette validation n’est pas obtenue.
5. Toute décision de validation ou rejet doit être tracée.
6. Les contrôles internes doivent empêcher les engagements hors procédure.  

## Module 17 — Reporting / KPI / Direction

1. Les indicateurs de pilotage doivent être calculés à partir des données opérationnelles réellement enregistrées dans l’ERP.
2. La direction doit pouvoir comparer marge prévue et marge réelle.
3. Les indicateurs doivent être disponibles par axe métier pertinent.
4. Les KPI projet doivent permettre de suivre l’avancement physique et financier.
5. Les KPI maintenance doivent permettre de suivre tickets, SLA, temps moyen de résolution et récurrence.
6. Les KPI finance doivent permettre de suivre factures émises, encaissements, reste à facturer et DSO (délai de paiement).
7. Les KPI doivent être consultables à des niveaux de granularité compatibles avec le pilotage direction. 

## Module 18 — Vue transverse Affaire / Projet

1. Tout projet doit pouvoir centraliser les informations de vente, exécution, finance et maintenance qui le concernent.
2. Les objets liés à un projet doivent rester navigables depuis la fiche projet.
3. Le réalisé à date d’un projet doit refléter l’état consolidé des données disponibles.
4. Les risques et blocages doivent pouvoir être visibles au niveau projet ou de son affaire de rattachement.
5. Le projet est le noyau fonctionnel principal autour duquel s’organisent les autres modules de l’ERP.  

La suite logique est **3-d) Permissions**, toujours **module par module**.
