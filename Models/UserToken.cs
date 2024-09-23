using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexus_webapi.Models
{
    public class UserToken
    {
        [Key]
        [Column("token_id")]
        public int TokenId { get; set; }

        [Required]
        [Column("employee_id")]
        public int EmployeeId { get; set; }

        [Required]
        [Column("token")]
        [MaxLength(1024)]
        public string Token { get; set; }

        [Required]
        [Column("expiration")]
        public DateTime Expiration { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [ForeignKey("EmployeeId")]
        public Employees Employee { get; set; }
    }
}