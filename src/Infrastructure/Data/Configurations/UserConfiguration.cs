using Core.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(u => u.DisplayName)
            .IsRequired(false);

        builder.Property(u => u.Bio)
            .IsRequired(false);

        builder.Property(u => u.Picture)
            .IsRequired(false);

        builder.HasMany(u => u.Activities)
            .WithOne(aa => aa.User)
            .HasForeignKey(aa => aa.UserId);

        builder.HasMany(u => u.RefreshTokens)
            .WithOne(r => r.User)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
