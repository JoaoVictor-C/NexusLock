using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexus_webapi.Models;

public class Roles
{
    [Key]
    [Column("role_id")]
    public int RoleId { get; set; }

    [Required]
    [Column("role_name")]
    [StringLength(50)]
    public string RoleName { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    public ICollection<RolePermissions> RolePermissions { get; set; }
}
