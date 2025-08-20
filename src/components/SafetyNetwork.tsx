import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSafetyNetwork } from '@/hooks/useSafetyNetwork';
import { useI18n } from '@/hooks/useI18n';
import { 
  Shield, 
  Plus, 
  Phone, 
  Mail, 
  User, 
  Heart, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Edit
} from 'lucide-react';

const SafetyNetwork: React.FC = () => {
  const { t } = useI18n();
  const {
    contacts,
    loading,
    addContact,
    updateContact,
    removeContact,
    verifyContact,
    triggerCrisisAlert,
    getEmergencyContacts,
    getCrisisContacts,
    getVerificationStats
  } = useSafetyNetwork();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [formData, setFormData] = useState({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    relationship: 'friend' as 'family' | 'friend' | 'partner' | 'therapist',
    emergency_contact: false,
    crisis_notifications: true
  });

  const relationshipIcons = {
    family: Users,
    friend: User,
    partner: Heart,
    therapist: Shield
  };

  const verificationStats = getVerificationStats();
  const emergencyContacts = getEmergencyContacts();
  const crisisContacts = getCrisisContacts();

  const handleSubmit = async () => {
    if (!formData.contact_name) return;

    if (editingContact) {
      await updateContact(editingContact.id, formData);
      setEditingContact(null);
    } else {
      await addContact(formData);
      setShowAddDialog(false);
    }

    setFormData({
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      relationship: 'friend',
      emergency_contact: false,
      crisis_notifications: true
    });
  };

  const startEdit = (contact: any) => {
    setEditingContact(contact);
    setFormData({
      contact_name: contact.contact_name,
      contact_phone: contact.contact_phone || '',
      contact_email: contact.contact_email || '',
      relationship: contact.relationship,
      emergency_contact: contact.emergency_contact,
      crisis_notifications: contact.crisis_notifications
    });
    setShowAddDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="gap-1 bg-green-100 text-green-800"><CheckCircle className="w-3 h-3" />Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'declined':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Declined</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
          {t('safetyNetwork.title')}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t('safetyNetwork.subtitle')}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Contacts</p>
                <p className="text-2xl font-bold">{verificationStats.total}</p>
              </div>
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Verified</p>
                <p className="text-2xl font-bold text-green-600">{verificationStats.verified}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Emergency</p>
                <p className="text-2xl font-bold text-red-600">{emergencyContacts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Crisis Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{crisisContacts.length}</p>
              </div>
              <Phone className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Crisis Alert */}
      {crisisContacts.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Crisis Alert
            </CardTitle>
            <CardDescription>
              Send immediate alert to your crisis support contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Send Crisis Alert
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Send Crisis Alert?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will immediately notify {crisisContacts.length} of your verified crisis contacts.
                    Use this only when you need immediate support.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => triggerCrisisAlert("Crisis alert triggered from Safety Network", "high")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Send Alert
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      {/* Add Contact Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Safety Contacts</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t('safetyNetwork.addContact')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingContact ? 'Edit Contact' : 'Add Safety Contact'}
              </DialogTitle>
              <DialogDescription>
                Add someone to your safety network for emergency support
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                  placeholder="Contact name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                  placeholder="contact@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Relationship</Label>
                <Select
                  value={formData.relationship}
                  onValueChange={(value) => setFormData({...formData, relationship: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">{t('safetyNetwork.contactTypes.family')}</SelectItem>
                    <SelectItem value="friend">{t('safetyNetwork.contactTypes.friend')}</SelectItem>
                    <SelectItem value="partner">{t('safetyNetwork.contactTypes.partner')}</SelectItem>
                    <SelectItem value="therapist">{t('safetyNetwork.contactTypes.therapist')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emergency">Emergency Contact</Label>
                  <Switch
                    id="emergency"
                    checked={formData.emergency_contact}
                    onCheckedChange={(checked) => setFormData({...formData, emergency_contact: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="crisis">Crisis Notifications</Label>
                  <Switch
                    id="crisis"
                    checked={formData.crisis_notifications}
                    onCheckedChange={(checked) => setFormData({...formData, crisis_notifications: checked})}
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!formData.contact_name}
                className="w-full"
              >
                {editingContact ? 'Update Contact' : 'Add Contact'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contacts List */}
      <div className="grid gap-4">
        {contacts.map((contact) => {
          const RelationshipIcon = relationshipIcons[contact.relationship];
          
          return (
            <Card key={contact.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <RelationshipIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{contact.contact_name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {t(`safetyNetwork.contactTypes.${contact.relationship}`)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {contact.contact_phone && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {contact.contact_phone}
                          </span>
                        )}
                        {contact.contact_email && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {contact.contact_email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(contact.verification_status)}
                      <div className="flex gap-1">
                        {contact.emergency_contact && (
                          <Badge variant="destructive" className="text-xs">Emergency</Badge>
                        )}
                        {contact.crisis_notifications && (
                          <Badge variant="secondary" className="text-xs">Crisis</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(contact)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Contact?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {contact.contact_name} from your safety network?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeContact(contact.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {contacts.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Safety Contacts</h3>
          <p className="text-muted-foreground mb-4">
            Build your safety network by adding trusted contacts
          </p>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add First Contact
          </Button>
        </div>
      )}
    </div>
  );
};

export default SafetyNetwork;