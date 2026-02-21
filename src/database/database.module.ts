import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global() // Rend ce module global, donc ses providers sont disponibles dans toute l'application sans besoin de l'importer.
@Module({
  providers: [DatabaseService], // Enregistre DatabaseService comme provider pour qu'il puisse être injecté dans d'autres classes.
  exports: [DatabaseService], // Exporte DatabaseService pour qu'il puisse être injecté dans d'autres modules.
})
export class DatabaseModule {}
