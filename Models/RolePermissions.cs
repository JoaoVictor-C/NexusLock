using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexus_webapi.Models;

public class RolePermissions
{
    [Key]
    [Column("role_permission_id")]
    public int RolePermissionId { get; set; }

    [Required]
    [Column("role_id")]
    public int RoleId { get; set; }

    [Required]
    [Column("permission_id")]
    public int PermissionId { get; set; }

    [ForeignKey("RoleId")]
    public Roles Role { get; set; }

    [ForeignKey("PermissionId")]
    public Permissions Permission { get; set; }
}
