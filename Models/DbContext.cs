using Microsoft.EntityFrameworkCore;

namespace Nexus_webapi.Models
{
    public class NexusDbContext : DbContext
    {
        public NexusDbContext(DbContextOptions<NexusDbContext> options)
            : base(options)
        {
        }

        // DbSet properties mapping to database tables
        public DbSet<Employees> Employees { get; set; } = null!;
        public DbSet<Rooms> Rooms { get; set; } = null!;
        public DbSet<AccessLogs> AccessLogs { get; set; } = null!;
        public DbSet<Roles> Roles { get; set; } = null!;
        public DbSet<EmployeeRoles> EmployeeRoles { get; set; } = null!;
        public DbSet<EmployeeRoomAccess> EmployeeRoomAccesses { get; set; } = null!;
        public DbSet<Permissions> Permissions { get; set; } = null!;
        public DbSet<RolePermissions> RolePermissions { get; set; } = null!;
        public DbSet<UserToken> UserTokens { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Employees entity configuration
            modelBuilder.Entity<Employees>(entity =>
            {
                entity.ToTable("employees");

                entity.HasKey(e => e.EmployeeId);

                entity.Property(e => e.EmployeeId)
                      .HasColumnName("employee_id")
                      .ValueGeneratedOnAdd();

                entity.Property(e => e.Name)
                      .IsRequired()
                      .HasMaxLength(100)
                      .HasColumnName("name");

                entity.Property(e => e.Email)
                      .IsRequired()
                      .HasMaxLength(100)
                      .HasColumnName("email");

                entity.HasIndex(e => e.Email)
                      .IsUnique()
                      .HasDatabaseName("UQ_email");

                entity.Property(e => e.PasswordHash)
                      .IsRequired()
                      .HasMaxLength(256)
                      .HasColumnName("password_hash");

                entity.Property(e => e.PinCode)
                      .IsRequired()
                      .HasMaxLength(4)
                      .HasColumnName("pin_code");

                entity.HasIndex(e => e.PinCode)
                      .IsUnique()
                      .HasDatabaseName("UQ_pin_code");

                entity.Property(e => e.FingerprintData)
                      .HasColumnName("fingerprint_data");

                entity.Property(e => e.FingerprintDataBase64)
                      .HasColumnName("fingerprint_data_base64");
            });

            // Rooms entity configuration
            modelBuilder.Entity<Rooms>(entity =>
            {
                entity.ToTable("rooms");

                entity.HasKey(r => r.RoomId);

                entity.Property(r => r.RoomId)
                      .HasColumnName("room_id")
                      .ValueGeneratedOnAdd();

                entity.Property(r => r.Name)
                      .IsRequired()
                      .HasMaxLength(100)
                      .HasColumnName("name");

                entity.Property(r => r.Description)
                      .HasColumnName("description");

                entity.Property(r => r.Status)
                      .IsRequired()
                      .HasColumnName("status")
                      .HasDefaultValue(false);

                entity.Property(r => r.Image)
                      .HasColumnName("image");

                entity.Property(r => r.OccupiedByEmployeeId)
                      .HasColumnName("occupied_by_employee_id");
            });

            // AccessLogs entity configuration
            modelBuilder.Entity<AccessLogs>(entity =>
            {
                entity.ToTable("accesslogs");

                entity.HasKey(al => al.LogId);

                entity.Property(al => al.LogId)
                      .HasColumnName("log_id")
                      .ValueGeneratedOnAdd();

                entity.Property(al => al.EmployeeId)
                      .HasColumnName("employee_id");

                entity.Property(al => al.RoomId)
                      .HasColumnName("room_id");

                entity.Property(al => al.AccessTime)
                      .HasColumnName("access_time")
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(al => al.AccessGranted)
                      .HasColumnName("access_granted");

                entity.HasIndex(al => al.EmployeeId)
                      .HasDatabaseName("employee_id");

                entity.HasIndex(al => al.RoomId)
                      .HasDatabaseName("room_id");
            });

            // Roles entity configuration
            modelBuilder.Entity<Roles>(entity =>
            {
                entity.ToTable("roles");

                entity.HasKey(r => r.RoleId);

                entity.Property(r => r.RoleId)
                      .HasColumnName("role_id")
                      .ValueGeneratedOnAdd();

                entity.Property(r => r.RoleName)
                      .IsRequired()
                      .HasMaxLength(50)
                      .HasColumnName("role_name");

                entity.Property(r => r.Description)
                      .HasColumnName("description");
            });

            // EmployeeRoles entity configuration
            modelBuilder.Entity<EmployeeRoles>(entity =>
            {
                entity.ToTable("employeeroles");

                entity.HasKey(er => er.EmployeeRoleId);

                entity.Property(er => er.EmployeeRoleId)
                      .HasColumnName("employee_role_id")
                      .ValueGeneratedOnAdd();

                entity.Property(er => er.EmployeeId)
                      .HasColumnName("employee_id");

                entity.Property(er => er.RoleId)
                      .HasColumnName("role_id");

                entity.HasIndex(er => er.EmployeeId)
                      .HasDatabaseName("employee_id");

                entity.HasIndex(er => er.RoleId)
                      .HasDatabaseName("role_id");
            });

            // EmployeeRoomAccess entity configuration
            modelBuilder.Entity<EmployeeRoomAccess>(entity =>
            {
                entity.ToTable("employeeroomaccess");

                entity.HasKey(era => era.AccessId);

                entity.Property(era => era.AccessId)
                      .HasColumnName("access_id")
                      .ValueGeneratedOnAdd();

                entity.Property(era => era.EmployeeId)
                      .HasColumnName("employee_id");

                entity.Property(era => era.RoomId)
                      .HasColumnName("room_id");

                entity.HasIndex(era => era.EmployeeId)
                      .HasDatabaseName("employee_id");

                entity.HasIndex(era => era.RoomId)
                      .HasDatabaseName("room_id");
            });

            // Permissions entity configuration
            modelBuilder.Entity<Permissions>(entity =>
            {
                entity.ToTable("permissions");

                entity.HasKey(p => p.PermissionId);

                entity.Property(p => p.PermissionId)
                      .HasColumnName("permission_id")
                      .ValueGeneratedOnAdd();

                entity.Property(p => p.PermissionKey)
                      .IsRequired()
                      .HasMaxLength(50)
                      .HasColumnName("permission_key");

                entity.Property(p => p.Description)
                      .HasColumnName("description");
            });

            // RolePermissions entity configuration
            modelBuilder.Entity<RolePermissions>(entity =>
            {
                entity.ToTable("rolepermissions");

                entity.HasKey(rp => rp.RolePermissionId);

                entity.Property(rp => rp.RolePermissionId)
                      .HasColumnName("role_permission_id")
                      .ValueGeneratedOnAdd();

                entity.Property(rp => rp.RoleId)
                      .HasColumnName("role_id");

                entity.Property(rp => rp.PermissionId)
                      .HasColumnName("permission_id");

                entity.HasIndex(rp => rp.RoleId)
                      .HasDatabaseName("role_id");

                entity.HasIndex(rp => rp.PermissionId)
                      .HasDatabaseName("permission_id");

                entity.HasIndex(rp => new { rp.RoleId, rp.PermissionId })
                      .HasDatabaseName("idx_role_permission");

                entity.HasOne(rp => rp.Role)
                      .WithMany(r => r.RolePermissions)
                      .HasForeignKey(rp => rp.RoleId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // UserTokens entity configuration
            modelBuilder.Entity<UserToken>(entity =>
            {
                entity.ToTable("usertokens");

                entity.HasKey(ut => ut.TokenId);

                entity.Property(ut => ut.TokenId)
                      .HasColumnName("token_id")
                      .ValueGeneratedOnAdd();

                entity.Property(ut => ut.EmployeeId)
                      .IsRequired()
                      .HasColumnName("employee_id");

                entity.Property(ut => ut.Token)
                      .IsRequired()
                      .HasMaxLength(1024)
                      .HasColumnName("token");

                entity.Property(ut => ut.Expiration)
                      .IsRequired()
                      .HasColumnName("expiration");

                entity.Property(ut => ut.CreatedAt)
                      .HasColumnName("created_at")
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(ut => ut.EmployeeId)
                      .HasDatabaseName("employee_id");

                entity.HasIndex(ut => ut.Token)
                      .HasDatabaseName("token")
                      .IsUnique();

                entity.HasIndex(ut => ut.Expiration)
                      .HasDatabaseName("expiration");
            });

            // Configure default values and other settings
            ConfigureDefaultValues(modelBuilder);
            ConfigureMaxLengths(modelBuilder);
        }

        private void ConfigureDefaultValues(ModelBuilder modelBuilder)
        {
            // AccessLog default value
            modelBuilder.Entity<AccessLogs>()
                .Property(al => al.AccessTime)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // UserToken default value
            modelBuilder.Entity<UserToken>()
                .Property(ut => ut.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }

        private void ConfigureMaxLengths(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Employees>(entity =>
            {
                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.PasswordHash).HasMaxLength(256);
                entity.Property(e => e.PinCode).HasMaxLength(4);
            });

            modelBuilder.Entity<Rooms>(entity =>
            {
                entity.Property(r => r.Name).HasMaxLength(100);
            });

            modelBuilder.Entity<Roles>(entity =>
            {
                entity.Property(r => r.RoleName).HasMaxLength(50);
            });

            modelBuilder.Entity<Permissions>(entity =>
            {
                entity.Property(p => p.PermissionKey).HasMaxLength(50);
            });

            modelBuilder.Entity<UserToken>(entity =>
            {
                entity.Property(ut => ut.Token).HasMaxLength(1024);
            });
        }
    }
}