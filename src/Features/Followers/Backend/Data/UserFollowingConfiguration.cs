using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations;

public class UserFollowingConfiguration : IEntityTypeConfiguration<UserFollowing>
{
    public void Configure(EntityTypeBuilder<UserFollowing> builder)
    {
        builder.HasKey(uf => new { uf.ObserverId, uf.TargetId });

        builder.HasOne(uf => uf.Observer)
            .WithMany(u => u.Followings)
            .HasForeignKey(uf => uf.ObserverId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(uf => uf.Target)
            .WithMany(u => u.Followers)
            .HasForeignKey(uf => uf.TargetId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
