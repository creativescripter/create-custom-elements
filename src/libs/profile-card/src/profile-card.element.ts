import { CustomElement, Prop, Watch } from 'custom-elements-ts';
import { debounceTime, distinctUntilChanged, flatMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { Profile, getProfiles } from './profile-card';

@CustomElement({
  tag: 'profile-card',
  templateUrl: './profile-card.element.html',
  styleUrl: './profile-card.element.scss',
  shadow: false
})
export class ProfileCardElement extends HTMLElement {

  @Prop() profiles: Profile[] = [];

  @Watch('profiles')
  async onPropertyChangedProfiles(value: any) {
    if (value.new && Array.isArray(value.new)) {
      const children = this.querySelectorAll('ar-card');
      await Promise.all(Array.from(children).map(child => child.remove()));
      
      const container = this.querySelector('div.container');
      container.appendChild(this.createCardItem(value.new));
    }
  }

  connectedCallback() {
    const input: any = this.querySelector('ar-input');
    getProfiles(input.value).subscribe(profiles => { 
      this.profiles = profiles 
    });

    input.addEventListener('ar.change', function(e: CustomEvent | any) {
      of(e.detail.value)
        .pipe(debounceTime(700), distinctUntilChanged())
        .pipe(flatMap(text => getProfiles(text)))
        .subscribe(profiles => {
          this.profiles = profiles;
        });    
    }.bind(this));
  }

  private createCardItem(profiles: Profile[]) {
    const profileCards = profiles.map(profile => {
      const value = JSON.stringify(profile);
      return `<ar-card class="col-md-3" profile='${value}'></ar-card>`;
    });
    const template = document.createElement('template');
    template.innerHTML = `${profileCards.join('\n')}`;
    return document.importNode(template.content, true);
  }



}