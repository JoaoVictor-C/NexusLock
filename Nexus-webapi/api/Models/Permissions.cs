using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexus_webapi.Models;

public class Permissions
{
    [Key]
    [Column("permission_id")]
    public int PermissionId { get; set; }
    
    [Required]
    [Column("permission_key")]
    [StringLength(50)]
    public string PermissionKey { get; set; }
    
    [Column("description")]
    public string? Description { get; set; }
}
