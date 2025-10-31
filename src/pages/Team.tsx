import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types"; // Assuming types are updated
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // Added Button import
import { Link } from "react-router-dom"; // Added Link import

// Define the Team Member interface based on your Supabase table
interface TeamMemberData extends Tables<"team_members"> {}

// Define the structure for grouped team data
interface GroupedTeamData {
  [department: string]: TeamMemberData[];
}

// Define the desired order of departments
// Define the desired order of departments
const departmentOrder = [
  "Leadership", // Assuming President/VP are here
  "Logistics & Operation",
  "Finance",
  "Production",
  "Communication",
  "Curation",
  "Hospitality",
  // Add any other departments here, they will appear last alphabetically
];


const Team = () => {
  const [teamData, setTeamData] = useState<GroupedTeamData>({});
  const [sortedDepartments, setSortedDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeamMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all team data, ordered by department, then display_order (NULLs last), then name
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('department', { ascending: true })
        .order('display_order', { ascending: true, nullsFirst: false }) // Ensures Leads/President/VP with order 1, 2 come first
        .order('name', { ascending: true }); // Alphabetical sort for members within the same display_order/NULL

      if (error) throw error;

      // Group members by department
      const groupedData: GroupedTeamData = {};
      data.forEach(member => {
        if (!groupedData[member.department]) {
          groupedData[member.department] = [];
        }
        groupedData[member.department].push(member);
      });

      setTeamData(groupedData);

      // Create a sorted list of department names based on predefined order + alphabetical for others
      const fetchedDepartments = Object.keys(groupedData);
      const sorted = fetchedDepartments.sort((a, b) => {
        const indexA = departmentOrder.indexOf(a);
        const indexB = departmentOrder.indexOf(b);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB; // Both in predefined order
        if (indexA !== -1) return -1; // Only A is predefined
        if (indexB !== -1) return 1; // Only B is predefined
        return a.localeCompare(b); // Neither predefined, sort alphabetically
      });
      setSortedDepartments(sorted);


    } catch (error: any) {
      console.error("Error fetching team members:", error);
      toast.error(`Could not load team members: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  // --- Skeleton Card Component ---
  const TeamMemberSkeleton = () => (
    <Card className="bg-card border border-border">
      <CardContent className="p-6 text-center">
        <div className="relative mb-6">
          <Skeleton className="w-32 h-32 mx-auto rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-4 w-1/2 mx-auto mb-4" />
        {/* Removed social links skeleton */}
      </CardContent>
    </Card>
  );

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-background to-primary/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center animate-fade-in">
            <h1 className="text-5xl font-bold mb-8">
              Meet Our <span className="gradient-text">Team</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              The passionate individuals behind TEDxAUC working tirelessly to bring our inaugural event to life and spread ideas worth sharing.
            </p>
          </div>
        </div>
      </section>

      {/* Team Sections Grid */}
      <section className="section-padding space-y-16"> {/* Added space between department sections */}
        {isLoading ? (
           // Show skeleton loaders while loading
           <div className="mx-auto max-w-7xl px-6 lg:px-8">
               <Skeleton className="h-8 w-1/3 mb-8"/>
               {/* Show 5 skeletons per row for XL */}
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                   {[...Array(5)].map((_, i) => <TeamMemberSkeleton key={`skel-dep1-${i}`} />)}
               </div>
               <Skeleton className="h-8 w-1/3 mt-16 mb-8"/>
                {/* Show 5 skeletons per row for XL */}
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                   {[...Array(5)].map((_, i) => <TeamMemberSkeleton key={`skel-dep2-${i}`} />)}
               </div>
           </div>
        ) : (
          // Render actual team data
          sortedDepartments.map((department) => (
            <div key={department} className="mx-auto max-w-7xl px-6 lg:px-8 animate-fade-in">
              <h2 className="text-3xl font-bold mb-8 border-l-4 border-primary pl-4 gradient-text">
                {department}
              </h2>
              {/* --- THIS IS THE UPDATED LINE --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {teamData[department].map((member) => (
                  <Card key={member.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-card border border-border hover:border-primary/50 overflow-hidden">
                    <CardContent className="p-6 text-center flex flex-col items-center">
                      <div className="relative mb-4 w-32 h-32">
                        <img
                          src={member.image_url}
                          alt={member.name}
                          className="w-full h-full object-cover rounded-full border-4 border-primary/20 group-hover:border-primary/50 transition-all duration-300"
                          onError={(e) => {
                             e.currentTarget.onerror = null;
                             e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>

                      <h3 className="text-xl font-bold mb-1 text-foreground">
                        {member.name}
                      </h3>

                      <p className="text-primary font-semibold mb-4 text-sm">
                        {member.position}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
         {!isLoading && sortedDepartments.length === 0 && (
            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center text-muted-foreground py-12">
                Team details coming soon!
            </div>
         )}
      </section>


      {/* Join Our Team CTA (Remains the same) */}
      <section className="section-padding bg-gradient-to-r from-primary/10 to-primary/5 border-y border-primary/20">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <h2 className="text-4xl font-bold mb-6">Want to Join Our Team?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            As we grow, we'll be looking for passionate individuals who share our vision
            of spreading ideas worth sharing.
          </p>
          <a
            href="mailto:team@tedxauc.org" // Make sure this email is correct
            className="hero-button inline-flex items-center"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
};

export default Team;