<template>
  <main class="app-shell">
    <header class="app-header" :class="{ 'is-compact': chart }">
      <div class="hero-content">
        <div class="brand-mark">
          <span class="brand-dot"></span>
          Natal chart app by Flat 18
        </div>
        <h1 class="hero-title">Natal Charts Generator</h1>
        <p class="hero-copy">
          A precise birth chart, simplified into the placements, patterns and timing that matter.
          <span v-if="!chart">Enter your birth details to begin with a clean chart reading.</span>
        </p>
      </div>

      <div class="profile-dock">
        <button class="profile-button" type="button" :aria-expanded="isProfileMenuOpen" @click="toggleProfileMenu">
          <span class="profile-avatar">
            <img v-if="profileIdentity" :src="profileIdentity.avatarSrc" :alt="profileIdentity.avatarLabel" />
            <span v-else aria-hidden="true">✦</span>
          </span>
          <span class="profile-copy">
            <span class="profile-kicker">{{ profileIdentity?.nickname ? 'Welcome back' : 'Welcome' }}</span>
            <strong class="profile-name">{{ profileIdentity?.nickname || 'Create your chart below' }}</strong>
            <!-- <span class="profile-subcopy">{{ profileStatusCopy }}</span> -->
          </span>
          <IconChevronDown :size="16" stroke-width="2" class="profile-chevron" />
        </button>

        <div v-if="isProfileMenuOpen" class="profile-menu" role="menu" aria-label="Profile actions">
          <p class="profile-menu-note">
            Your chart and all your data stay on this device.
          </p>

          <div v-if="profileIdentity" class="profile-card">
            <img class="profile-card-avatar" :src="profileIdentity.avatarSrc" :alt="profileIdentity.avatarLabel" />
            <div>
              <div class="profile-card-name">{{ profileIdentity.nickname }}</div>
              <div class="profile-card-copy">{{ profileIdentity.avatarLabel }}</div>
            </div>
          </div>

          <div v-if="profileBirthSummary" class="profile-birth-summary">
            <div class="profile-birth-summary-header">
              <div>
                <div class="profile-birth-summary-kicker">Birth data</div>
                <div class="profile-birth-summary-title">Current chart details</div>
              </div>
              <button class="subtle-button profile-birth-summary-button" type="button" @click="openBirthEditor">
                Edit
              </button>
            </div>

            <div class="profile-birth-summary-grid">
              <article class="profile-birth-summary-card profile-birth-summary-card--primary">
                <div class="profile-birth-summary-label">Current birth info</div>
                <div class="profile-birth-summary-value">
                  {{ profileBirthSummary.date }} · {{ profileBirthSummary.time }}
                </div>
                <div class="profile-birth-summary-copy">
                  {{ profileBirthSummary.location }}
                </div>
              </article>

              <article class="profile-birth-summary-card">
                <div class="profile-birth-summary-label">House</div>
                <div class="profile-birth-summary-value">
                  {{ profileBirthSummary.houseSystem }}
                </div>
              </article>

              <article class="profile-birth-summary-card">
                <div class="profile-birth-summary-label">Coordinates</div>
                <div class="profile-birth-summary-value">
                  {{ profileBirthSummary.coordinates }}
                </div>
              </article>
            </div>
          </div>

          <div v-if="storedShareMedia" class="profile-cache">
            <div class="profile-cache-header">
              <div>
                <div class="profile-cache-label">Last share</div>
                <div class="profile-cache-copy">
                  {{ formatMediaKind(storedShareMedia.kind) }} · {{ formatStoredAt(storedShareMedia.createdAt) }}
                </div>
              </div>
              <button class="subtle-button profile-cache-button" type="button" :disabled="!storedShareMedia.dataUrl"
                @click="openStoredShareMedia">
                Open
              </button>
            </div>
            <div class="profile-cache-file">{{ storedShareMedia.fileName }}</div>
          </div>

          <div class="profile-menu-actions">
            <button :class="['button', 'profile-reset-button', { 'is-armed': isProfileResetArmed }]" type="button"
              :aria-pressed="isProfileResetArmed" @click="handleProfileResetClick">
              {{ isProfileResetArmed ? 'Are you sure? Clear data' : 'Delete data and reset' }}
            </button>
          </div>
        </div>
      </div>

    </header>

    <div :class="['layout', { 'has-chart': chart, 'is-empty': !chart }]">
      <div class="stack">
        <BirthForm :loading="loading" :error="error" :resolved-location="resolvedLocation"
          :saved-birth-data="savedBirthData" :compact-summary="Boolean(chart)" :editor-request="birthEditorRequest"
          @submit="handleSubmit" @open-editor="openBirthEditor" />
      </div>

      <section v-if="chart" class="results-grid">
        <template v-if="chart">
          <DailyHoroscopeRail :cards="dailyHoroscopeCards" :chart="chart" :profile-identity="profileIdentity"
            :refreshed-at="dailyHoroscopeRefreshedAt" @go-share="scrollToShareSection"
            @go-advanced="openAdvancedViewFromDaily" @add-partner="openPartnerModal" />

          <SimplifiedChart ref="simplifiedChartRef" :chart="chart" :current-transits="currentTransits"
            :partner-reports="partnerReports" :resolved-location="resolvedLocation"
            @media-generated="handleMediaGenerated" @add-partner="openPartnerModal" @select-partner="selectPartnerChart"
            @remove-partner="removePartnerChart" />

          <section ref="advancedEntryRef" class="panel advanced-entry">
            <div class="panel-inner advanced-entry-inner">
              <div>
                <p class="simple-kicker">Advanced</p>
                <h2 class="section-title">Full chart data</h2>
                <p class="section-copy">Placements, aspects, houses, charts, compatibility and the PDF export.</p>
              </div>
              <button class="subtle-button advanced-view-button" type="button" :aria-expanded="isAdvancedView"
                @click="isAdvancedView = !isAdvancedView">
                <IconAdjustmentsHorizontal :size="18" stroke-width="2" />
                <span>{{ isAdvancedView ? 'Hide advanced view' : 'Open advanced view' }}</span>
              </button>
            </div>
          </section>

          <div v-if="isAdvancedView" ref="pdfTarget" class="advanced-results">
            <section class="panel">
              <div class="panel-inner">
                <div class="advanced-panel-header">
                  <div>
                    <h2 class="section-title">Chart details</h2>
                    <p class="section-copy">The birth details and coordinates used for this chart.</p>
                  </div>
                  <button class="button advanced-download-button" type="button" :disabled="isDownloading"
                    @click="downloadPdf">
                    {{ isDownloading ? 'Preparing PDF...' : 'Download chart PDF' }}
                  </button>
                </div>

                <div class="meta-grid">
                  <article class="meta-card">
                    <span class="meta-kicker">Date</span>
                    <div class="meta-value">{{ chart.meta.date }}</div>
                  </article>

                  <article class="meta-card">
                    <span class="meta-kicker">Time</span>
                    <div class="meta-value">{{ chart.meta.time }}</div>
                  </article>

                  <article class="meta-card">
                    <span class="meta-kicker">Coordinates</span>
                    <div class="meta-value">{{ chart.meta.lat.toFixed(2) }}, {{ chart.meta.lon.toFixed(2) }}</div>
                  </article>

                  <article class="meta-card">
                    <span class="meta-kicker">Time zone</span>
                    <div class="meta-value">{{ chart.meta.timeZone }}</div>
                    <div class="meta-subvalue">
                      {{ formatOffset(chart.meta.utcOffsetMinutes) }}
                      <span v-if="chart.meta.timeZoneOverride" class="meta-hint">(override)</span>
                    </div>
                  </article>

                  <article class="meta-card">
                    <span class="meta-kicker">House system</span>
                    <div class="meta-value">{{ formatHouseSystem(chart.meta.houseSystem) }}</div>
                  </article>
                </div>
              </div>
            </section>

            <section class="panel advanced-spotlight">
              <div class="panel-inner">
                <div class="map-row">
                  <section class="panel map-card">
                    <div class="panel-inner">
                      <div class="map-visual">
                        <div class="map-circle" :style="mapStyle">
                          <span class="map-crosshair map-crosshair--h"></span>
                          <span class="map-crosshair map-crosshair--v"></span>
                          <span class="map-marker"></span>
                        </div>
                      </div>
                      <div class="map-meta">
                        <div class="map-meta-title">Birth data</div>
                        <div class="map-meta-copy">
                          {{ chart.meta.date }} · {{ chart.meta.time }}
                        </div>
                        <div class="map-meta-copy">
                          {{ resolvedLocation.label }}.
                          {{ resolvedLocation.lat }},
                          {{ resolvedLocation.lon }}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section class="panel core-card">
                    <div class="panel-inner">
                      <h2 class="section-title">Core triad</h2>
                      <p class="section-copy">The three main placements for identity, feelings and first impressions.
                      </p>

                      <div class="core-list">
                        <article class="core-item">
                          <div class="core-title">Sun</div>
                          <div class="core-value">
                            <span v-if="corePlacements.sun" class="core-icon">
                              <ZodiacIcon :sign="corePlacements.sun.sign" :size="18" />
                            </span>
                            {{ formatPlacement(corePlacements.sun) }}
                          </div>
                          <div class="core-copy">Your basic drive, sense of self and direction.</div>
                        </article>

                        <article class="core-item">
                          <div class="core-title">Moon</div>
                          <div class="core-value">
                            <span v-if="corePlacements.moon" class="core-icon">
                              <ZodiacIcon :sign="corePlacements.moon.sign" :size="18" />
                            </span>
                            {{ formatPlacement(corePlacements.moon) }}
                          </div>
                          <div class="core-copy">Your feelings, instincts and emotional needs.</div>
                        </article>

                        <article class="core-item">
                          <div class="core-title">Ascendant</div>
                          <div class="core-value">
                            <span v-if="corePlacements.asc" class="core-icon">
                              <ZodiacIcon :sign="corePlacements.asc.sign" :size="18" />
                            </span>
                            {{ formatPlacement(corePlacements.asc) }}
                          </div>
                          <div class="core-copy">How you come across and how you meet the world.</div>
                        </article>
                      </div>
                    </div>
                  </section>
                </div>

                <div class="summary-row">
                  <ChartWheel :placements="chart.placements" :aspects="chart.aspects" :cusps="chart.houseCusps" />
                  <SummaryGauges :metrics="chart.metrics" />
                </div>
              </div>
            </section>

            <details class="panel advanced-accordion" open>
              <summary class="advanced-accordion-summary">
                <div>
                  <span class="advanced-accordion-kicker">Open first</span>
                  <h3>Daily context</h3>
                </div>
                <span class="advanced-accordion-chevron" aria-hidden="true"></span>
              </summary>
              <div class="advanced-accordion-body">
                <ElementModePanel :placements="chart.placements" />
                <PresentTimePanel v-if="currentTransits" :transits="currentTransits" />
                <FocusAreas :areas="chart.focusAreas" />
              </div>
            </details>

            <details ref="compatibilityAccordionRef" class="panel advanced-accordion">
              <summary class="advanced-accordion-summary">
                <div>
                  <span class="advanced-accordion-kicker">Optional</span>
                  <h3>Compatibility</h3>
                </div>
                <span class="advanced-accordion-chevron" aria-hidden="true"></span>
              </summary>
              <div class="advanced-accordion-body">
                <PartnerComparePanel :partners="partnerReports" :active-id="activePartner?.id || ''"
                  @add="openPartnerModal" @select="selectPartnerChart" @remove="removePartnerChart" />

                <div ref="comparisonDetailRef" class="compare-detail">
                  <RelationshipPanel v-if="relationshipReport" :report="relationshipReport"
                    primary-action-label="Add partner" secondary-action-label="Remove partner" @edit="openPartnerModal"
                    @clear="removeActivePartner" />

                  <SynastryAspectList v-if="activePartner" :aspects="synastryAspects" :label-a="'You'"
                    :label-b="activePartner?.label || 'Partner'" />

                  <CompositeChartPanel v-if="compositeChart" :composite="compositeChart" />
                </div>
              </div>
            </details>

            <details class="panel advanced-accordion">
              <summary class="advanced-accordion-summary">
                <div>
                  <span class="advanced-accordion-kicker">Reference</span>
                  <h3>Placements, aspects, and readings</h3>
                </div>
                <span class="advanced-accordion-chevron" aria-hidden="true"></span>
              </summary>
              <div class="advanced-accordion-body">
                <div class="card-grid vertical">
                  <PlacementTable :placements="chart.placements" />
                  <AspectList :aspects="chart.aspects" />
                </div>

                <InterpretationPanel :items="chart.interpretations" />
              </div>
            </details>
          </div>
        </template>
      </section>
    </div>

    <footer class="app-footer">
      <div class="footer-title">Docs</div>
      <ul class="footer-list">
        <li><button class="footer-link-button" type="button" @click="isAboutModalOpen = true">
            About this app
          </button></li>
        <li><button class="footer-link-button" type="button" @click="isPrivacyModalOpen = true">
            Privacy
          </button></li>
      </ul>
      <div class="footer-title">Attribution & licensing</div>
      <ul class="footer-list">
        <li>
          Built with ❤️ by <a href="https://flat18.co.uk">Flat 18</a>
        </li>
        <li>
          Source code on <a href="https://github.com/vswee/natal-chart-generator">GitHub</a>
        </li>
        <li>
          Geocoding: <a href="https://nominatim.openstreetmap.org/" target="_blank" rel="noreferrer">Nominatim</a> on
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> data ©
          OpenStreetMap contributors (ODbL).
        </li>
        <li>
          Ephemeris: <a href="https://www.astro.com/swisseph/" target="_blank" rel="noreferrer">Swiss Ephemeris</a> via
          <a href="https://github.com/prolaxu/swisseph-wasm" target="_blank" rel="noreferrer">swisseph-wasm</a>
          (GPL-3.0-or-later; Swiss Ephemeris dual-licensed GPL/commercial).
        </li>
        <li>
          Icons: <a href="https://tabler.io/icons" target="_blank" rel="noreferrer">Tabler Icons</a> (MIT).
        </li>
      </ul>
    </footer>

    <div v-if="isAboutModalOpen" class="modal-overlay" @click.self="isAboutModalOpen = false">
      <div class="modal-card about-modal" role="dialog" aria-modal="true" aria-labelledby="about-modal-title">
        <div class="modal-header">
          <div>
            <p class="modal-kicker">About</p>
            <h3 id="about-modal-title" class="modal-title">How does this app works and how accurate is it?</h3>
          </div>
          <button class="subtle-button" type="button" @click="isAboutModalOpen = false">Close</button>
        </div>

        <section class="about-hero">
          <div class="about-hero-copy">
            <p class="modal-copy about-intro-copy">
              This explains what is exact in the chart, what is interpretive, and how the app works.
            </p>

            <div class="about-pill-row">
              <span class="about-pill">
                <IconStars :size="16" stroke-width="1.8" />
                Based on astronomy
              </span>
              <span class="about-pill">
                <IconShieldCheck :size="16" stroke-width="1.8" />
                Trusted chart engine
              </span>
              <span class="about-pill">
                <IconSparkles :size="16" stroke-width="1.8" />
                Interpretive, not fixed
              </span>
            </div>
          </div>

          <div class="about-hero-art" aria-hidden="true">
            <div class="about-orbit about-orbit--outer"></div>
            <div class="about-orbit about-orbit--inner"></div>
            <div class="about-glow about-glow--a"></div>
            <div class="about-glow about-glow--b"></div>
            <div class="about-star about-star--a"></div>
            <div class="about-star about-star--b"></div>
            <div class="about-star about-star--c"></div>
            <div class="about-planet about-planet--major">
              <IconPlanet :size="34" stroke-width="1.8" />
            </div>
            <div class="about-planet about-planet--minor">
              <IconMoonStars :size="22" stroke-width="1.8" />
            </div>
            <div class="about-center-glyph">
              <IconNorthStar :size="20" stroke-width="1.8" />
            </div>
          </div>
        </section>

        <section class="about-stats" aria-label="About highlights">
          <article class="about-stat">
            <span class="about-stat-icon">
              <IconClock :size="18" stroke-width="1.9" />
            </span>
            <div>
              <div class="about-stat-label">Time</div>
              <div class="about-stat-value">Birth time is converted to UTC</div>
            </div>
          </article>

          <article class="about-stat">
            <span class="about-stat-icon">
              <IconMapPin :size="18" stroke-width="1.9" />
            </span>
            <div>
              <div class="about-stat-label">Location</div>
              <div class="about-stat-value">Coordinates come from the birthplace</div>
            </div>
          </article>

          <article class="about-stat">
            <span class="about-stat-icon">
              <IconChartDots3 :size="18" stroke-width="1.9" />
            </span>
            <div>
              <div class="about-stat-label">Chart engine</div>
              <div class="about-stat-value">Swiss Ephemeris in WebAssembly</div>
            </div>
          </article>
        </section>

        <div class="about-grid">
          <article class="about-card">
            <div class="about-card-head">
              <span class="about-card-icon">
                <IconNorthStar :size="20" stroke-width="1.8" />
              </span>
              <p class="about-kicker">Astronomy, astrology and method</p>
            </div>
            <h3 class="about-title">The chart is based on real sky positions</h3>
            <p class="about-copy">
              Astrology starts with astronomy. The chart uses the measured or modelled positions of the Sun, Moon,
              planets and key angles for a specific time and place on Earth. In simple terms, it is a sky map for the
              moment of birth.
            </p>
            <div class="about-divider" aria-hidden="true"></div>
            <p class="about-copy">
              The meaning side is different. Astrology is a symbolic system, not a scientific fact in the same way as
              physics or medicine. Most people use it as a tool for reflection, patterns and timing, not as proof that
              life has to unfold in one fixed way.
            </p>
          </article>

          <article class="about-card">
            <div class="about-card-head">
              <span class="about-card-icon">
                <IconAtom2 :size="20" stroke-width="1.8" />
              </span>
              <p class="about-kicker">Technology</p>
            </div>
            <h3 class="about-title">How the app calculates charts</h3>
            <p class="about-copy">
              The app uses Swiss Ephemeris in the browser. It is the same kind of ephemeris engine used in professional
              astrology software. That means planetary positions, house cusps, the Ascendant, the Midheaven,
              retrogrades and aspects are calculated properly rather than guessed from simple lookup tables.
            </p>
            <div class="about-divider" aria-hidden="true"></div>
            <ul class="about-list">
              <li>The birthplace is turned into latitude and longitude through geocoding.</li>
              <li>The time zone is worked out from the coordinates, then converted to UTC before calculation.</li>
              <li>House systems such as Placidus, Koch and Whole Sign are applied directly in the chart calculation.
              </li>
              <li>The written readings are then built from the placements, aspects, dignities and chart scores.</li>
            </ul>
          </article>

          <article class="about-card">
            <div class="about-card-head">
              <span class="about-card-icon">
                <IconShieldCheck :size="20" stroke-width="1.8" />
              </span>
              <p class="about-kicker">Accuracy and trust</p>
            </div>
            <h3 class="about-title">What is exact, and what to read more lightly</h3>
            <p class="about-copy">
              If the birth date, birth time and birthplace are correct, the chart calculation should line up closely
              with professional chart software. The biggest source of error is usually the birth data itself. Even a
              small change in birth time can shift the Ascendant, the house cusps and sometimes the Moon.
            </p>
            <div class="about-divider" aria-hidden="true"></div>
            <p class="about-copy">
              The written meanings are interpretations, not guarantees. You can trust the chart calculation, location
              handling and time handling. The written text is there to help you read the chart, and its value depends
              on accurate birth data, the house system you choose and whether the symbolism feels useful to you.
            </p>

            <div class="about-note">
              <IconMoonStars :size="18" stroke-width="1.8" />
              <span>The calculations are exact. The meaning stays symbolic and personal.</span>
            </div>
          </article>
        </div>
      </div>
    </div>

    <div v-if="isPrivacyModalOpen" class="modal-overlay" @click.self="isPrivacyModalOpen = false">
      <div class="modal-card about-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title">
        <div class="modal-header">
          <div>
            <p class="modal-kicker">Privacy</p>
            <h3 id="privacy-modal-title" class="modal-title">How your data is handled</h3>
          </div>
          <button class="subtle-button" type="button" @click="isPrivacyModalOpen = false">Close</button>
        </div>

        <section class="about-hero">
          <div class="about-hero-copy">
            <p class="modal-copy about-intro-copy">
              This app keeps your profile on your device if you choose to use it. Most of the work happens locally in
              your browser.
            </p>

            <div class="about-pill-row">
              <span class="about-pill">
                <IconShieldCheck :size="16" stroke-width="1.8" />
                Stored on device
              </span>
              <span class="about-pill">
                <IconChartDots3 :size="16" stroke-width="1.8" />
                Charts generated locally
              </span>
              <span class="about-pill">
                <IconMapPin :size="16" stroke-width="1.8" />
                Address used only for coordinates
              </span>
            </div>
          </div>

          <div class="about-hero-art" aria-hidden="true">
            <div class="about-orbit about-orbit--outer"></div>
            <div class="about-orbit about-orbit--inner"></div>
            <div class="about-glow about-glow--a"></div>
            <div class="about-glow about-glow--b"></div>
            <div class="about-star about-star--a"></div>
            <div class="about-star about-star--b"></div>
            <div class="about-star about-star--c"></div>
            <div class="about-planet about-planet--major">
              <IconShieldCheck :size="34" stroke-width="1.8" />
            </div>
            <div class="about-planet about-planet--minor">
              <IconMapPin :size="22" stroke-width="1.8" />
            </div>
            <div class="about-center-glyph">
              <IconChartDots3 :size="20" stroke-width="1.8" />
            </div>
          </div>
        </section>

        <section class="about-stats" aria-label="Privacy highlights">
          <article class="about-stat">
            <span class="about-stat-icon">
              <IconShieldCheck :size="18" stroke-width="1.9" />
            </span>
            <div>
              <div class="about-stat-label">Storage</div>
              <div class="about-stat-value">Birth details can be saved only on your device</div>
            </div>
          </article>

          <article class="about-stat">
            <span class="about-stat-icon">
              <IconMapPin :size="18" stroke-width="1.9" />
            </span>
            <div>
              <div class="about-stat-label">Third parties</div>
              <div class="about-stat-value">Only the address is sent for geocoding</div>
            </div>
          </article>

          <article class="about-stat">
            <span class="about-stat-icon">
              <IconChartDots3 :size="18" stroke-width="1.9" />
            </span>
            <div>
              <div class="about-stat-label">Chart work</div>
              <div class="about-stat-value">Everything else is generated in the browser</div>
            </div>
          </article>
        </section>

        <div class="about-grid">
          <article class="about-card">
            <div class="about-card-head">
              <span class="about-card-icon">
                <IconShieldCheck :size="20" stroke-width="1.8" />
              </span>
              <p class="about-kicker">What we keep</p>
            </div>
            <h3 class="about-title">Your chart stays local unless you delete it</h3>
            <p class="about-copy">
              Birth date, birth time, birthplace, chart data, nickname, avatar and cached share media can be saved to
              localStorage on this device. Nothing is sent to our servers.
            </p>
            <div class="about-divider" aria-hidden="true"></div>
            <p class="about-copy">
              Delete data and reset clears the local profile, chart and cached media from this browser.
            </p>
          </article>

          <article class="about-card">
            <div class="about-card-head">
              <span class="about-card-icon">
                <IconMapPin :size="20" stroke-width="1.8" />
              </span>
              <p class="about-kicker">What is shared</p>
            </div>
            <h3 class="about-title">The address is only used to get coordinates</h3>
            <p class="about-copy">
              The only information sent to a third party is the address or birthplace you enter for geocoding. This is
              needed to turn the location into latitude and longitude so the chart can be calculated correctly.
            </p>
            <div class="about-divider" aria-hidden="true"></div>
            <p class="about-copy">
              No birth time, chart interpretation, compatibility reading or other chart data is sent along with that
              request.
            </p>
          </article>

          <article class="about-card">
            <div class="about-card-head">
              <span class="about-card-icon">
                <IconChartDots3 :size="20" stroke-width="1.8" />
              </span>
              <p class="about-kicker">Local processing</p>
            </div>
            <h3 class="about-title">Everything else stays on your device</h3>
            <p class="about-copy">
              After the coordinates are found, the chart calculations happen locally in the app using Swiss Ephemeris in
              your browser. The readings, scores and chart views are generated there as well.
            </p>
            <div class="about-divider" aria-hidden="true"></div>
            <div class="about-note">
              <IconMoonStars :size="18" stroke-width="1.8" />
              <span>The address helps find coordinates. Your saved profile stays local on this device.</span>
            </div>
          </article>
        </div>
      </div>
    </div>

    <PartnerModal :open="isPartnerModalOpen" :loading="partnerLoading" :error="partnerError"
      :resolved-location="partnerResolvedLocation" @submit="handlePartnerSubmit" @close="closePartnerModal" />
  </main>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  IconAdjustmentsHorizontal,
  IconAtom2,
  IconChartDots3,
  IconChevronDown,
  IconClock,
  IconMapPin,
  IconMoonStars,
  IconNorthStar,
  IconPlanet,
  IconShieldCheck,
  IconSparkles,
  IconStars
} from '@tabler/icons-vue'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import BirthForm from './components/BirthForm.vue'
import SummaryGauges from './components/SummaryGauges.vue'
import FocusAreas from './components/FocusAreas.vue'
import RelationshipPanel from './components/RelationshipPanel.vue'
import PartnerModal from './components/PartnerModal.vue'
import PlacementTable from './components/PlacementTable.vue'
import AspectList from './components/AspectList.vue'
import InterpretationPanel from './components/InterpretationPanel.vue'
import ZodiacIcon from './components/ZodiacIcon.vue'
import ChartWheel from './components/ChartWheel.vue'
import ElementModePanel from './components/ElementModePanel.vue'
import PresentTimePanel from './components/PresentTimePanel.vue'
import PartnerComparePanel from './components/PartnerComparePanel.vue'
import SynastryAspectList from './components/SynastryAspectList.vue'
import CompositeChartPanel from './components/CompositeChartPanel.vue'
import SimplifiedChart from './components/SimplifiedChart.vue'
import DailyHoroscopeRail from './components/DailyHoroscopeRail.vue'
import { geocodeAddress } from './services/geocoding'
import { calculateNatalChart, calculateCurrentTransits, calculateCompositeChart } from './services/astrology'
import worldMap from './assets/img/3-Equirectangular_projection_world_map_without_borders.svg'
import { toTitleCase } from './utils/zodiac'
import { buildRelationshipReport } from './utils/relationship'
import { buildCrossAspects } from './utils/aspects'
import { buildProfileIdentity } from './utils/profile'
import { clearStoredProfile, readStoredProfile, writeStoredProfile } from './utils/storage'

const loading = ref(false)
const error = ref('')
const resolvedLocation = ref(null)
const chart = ref(null)
const pdfTarget = ref(null)
const isDownloading = ref(false)
const partnerCharts = ref([])
const activePartnerId = ref('')
const partnerLoading = ref(false)
const partnerError = ref('')
const partnerResolvedLocation = ref(null)
const isPartnerModalOpen = ref(false)
const isAboutModalOpen = ref(false)
const isPrivacyModalOpen = ref(false)
const isProfileMenuOpen = ref(false)
const isProfileResetArmed = ref(false)
const birthEditorRequest = ref(0)
const currentTransits = ref(null)
const dailyHoroscopeCards = ref([])
const dailyHoroscopeRefreshedAt = ref('')
const compositeChart = ref(null)
const comparisonDetailRef = ref(null)
const compatibilityAccordionRef = ref(null)
const simplifiedChartRef = ref(null)
const advancedEntryRef = ref(null)
const isAdvancedView = ref(false)
const savedBirthData = ref(null)
const storedShareMedia = ref(null)
const storedProfileRecord = ref(null)
let motionFrame = 0
let scrollMotionInterval = 0
let motionObserver = null
let isMotionSurfaceVisible = false
let isTouchMotion = false
const profileIdentity = computed(() => {
  if (chart.value) return buildProfileIdentity(chart.value)
  return storedProfileRecord.value?.profile || null
})
const profileStatusCopy = computed(() => {
  if (chart.value) return 'Your chart is loaded and ready.'
  if (savedBirthData.value) return 'Your chart is stored locally on this device.'
  return 'Create a chart to generate your local profile.'
})
const profileBirthSummary = computed(() => {
  const chartMeta = chart.value?.meta || null
  const birthData = savedBirthData.value || {}
  const location = resolvedLocation.value || null

  if (!chartMeta && !birthData.date && !birthData.time && !birthData.address) return null

  return {
    date: formatBirthDate(chartMeta?.date || birthData.date || ''),
    time: chartMeta?.time || birthData.time || 'Time not set',
    location: location?.label || birthData.address || 'Location not set',
    houseSystem: formatHouseSystem(chartMeta?.houseSystem || birthData.houseSystem || 'placidus'),
    coordinates: formatCoordinates(chartMeta?.lat ?? location?.lat ?? birthData.lat, chartMeta?.lon ?? location?.lon ?? birthData.lon)
  }
})
const corePlacements = computed(() => {
  if (!chart.value) return { sun: null, moon: null, asc: null }

  const placements = chart.value.placements || []
  const findBody = (body) => placements.find((item) => item.body === body)

  return {
    sun: findBody('sun'),
    moon: findBody('moon'),
    asc: findBody('asc')
  }
})
const activePartner = computed(() => {
  if (!partnerCharts.value.length) return null
  const match = partnerCharts.value.find((partner) => partner.id === activePartnerId.value)
  return match || partnerCharts.value[0]
})

const partnerReports = computed(() => {
  if (!chart.value) return []
  return partnerCharts.value.map((partner) => ({
    ...partner,
    report: buildRelationshipReport(chart.value, partner.chart, {
      labelA: 'You',
      labelB: partner.label
    })
  }))
})

const relationshipReport = computed(() => {
  if (!chart.value || !activePartner.value) return null
  return buildRelationshipReport(chart.value, activePartner.value.chart, {
    labelA: 'You',
    labelB: activePartner.value.label
  })
})

const synastryAspects = computed(() => {
  if (!chart.value || !activePartner.value) return []
  const allowedBodies = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
    'asc'
  ]
  return buildCrossAspects(chart.value.placements, activePartner.value.chart.placements, allowedBodies)
})
const mapStyle = computed(() => {
  if (!chart.value) return {}

  const { lat, lon } = chart.value.meta
  const lonPercent = ((lon + 180) / 360) * 100
  const x = 50
  const y = ((90 - lat) / 180) * 100
  const mapShiftX = 2 * lonPercent - 50

  return {
    '--crosshair-x': `${x}%`,
    '--crosshair-y': `${y}%`,
    '--map-shift-x': `${mapShiftX}%`,
    backgroundImage: `url(${worldMap})`
  }
})

function createLocalDate(baseDate, offsetDays) {
  const next = new Date(baseDate)
  next.setDate(next.getDate() + offsetDays)
  return next
}

function formatShortDay(date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date)
  } catch (error) {
    return date.toLocaleDateString()
  }
}

function getPlacementSign(chartData, body) {
  const placements = Array.isArray(chartData?.placements) ? chartData.placements : []
  const placement = placements.find((item) => item.body === body)
  return placement?.sign ? toTitleCase(placement.sign) : ''
}

function formatRetrogradeLabels(transits) {
  const retrogrades = Array.isArray(transits?.retrogrades) ? transits.retrogrades : []
  if (!retrogrades.length) return 'Most planets are direct'

  const labels = retrogrades.map((placement) => toTitleCase(placement.body))
  if (labels.length === 1) return `${labels[0]} is retrograde`
  if (labels.length === 2) return `${labels[0]} and ${labels[1]} are retrograde`
  return `${labels.slice(0, -1).join(', ')}, and ${labels.at(-1)} are retrograde`
}

function normaliseGlyphKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildHoroscopeChips(dayKey, transit, moonSign, retrogrades) {
  const chips = []

  if (transit?.moon) {
    const phaseName = transit.moon.phaseName || 'Moon phase'
    chips.push({
      key: `${dayKey}-moon-sign`,
      type: 'moon',
      iconKind: 'body',
      icon: 'moon',
      label: `Moon in ${moonSign}`
    })
    chips.push({
      key: `${dayKey}-moon-phase`,
      type: 'phase',
      iconKind: 'phase',
      icon: normaliseGlyphKey(phaseName),
      label: phaseName
    })
  } else {
    chips.push({
      key: `${dayKey}-moon-unavailable`,
      type: 'moon',
      iconKind: 'body',
      icon: 'moon',
      label: 'Moon data unavailable'
    })
  }

  retrogrades.forEach((placement) => {
    if (!placement?.body) return
    chips.push({
      key: `${dayKey}-${placement.body}-retrograde`,
      type: 'retrograde',
      iconKind: 'body',
      icon: placement.body,
      stateIconKind: 'body',
      stateIcon: 'retrograde',
      label: `${toTitleCase(placement.body)} retrograde`
    })
  })

  return chips
}

function buildHoroscopeCopy(dayKey, chartData, transits) {
  const natalSun = getPlacementSign(chartData, 'sun')
  const natalMoon = getPlacementSign(chartData, 'moon')
  const natalAsc = getPlacementSign(chartData, 'asc')
  const natalMoonText = natalMoon ? `Moon in ${natalMoon}` : 'your Moon'
  const natalAscText = natalAsc ? `Ascendant in ${natalAsc}` : 'your Ascendant'
  const natalSunText = natalSun ? `Sun in ${natalSun}` : 'your Sun'
  const moonSign = transits?.moon?.sign ? toTitleCase(transits.moon.sign) : 'the current Moon'
  const moonPhase = transits?.moon?.phaseName ? transits.moon.phaseName.toLowerCase() : 'current'
  const retrogradeText = formatRetrogradeLabels(transits)

  const copyMap = {
    yesterday: `Yesterday wanted less noise. ${natalMoonText} does better when you finish one open loop before adding another. ${retrogradeText}.`,
    today: `Today lands with the Moon in ${moonSign} and a ${moonPhase} feel. ${natalAscText} prefers a clean move, a short list, and one obvious yes.`,
    tomorrow: `Tomorrow opens more space. ${natalSunText} gets traction from a direct choice, and the ${moonSign} Moon keeps the pace flexible. ${retrogradeText}.`,
    future: `The next day asks for a little more range. ${natalMoonText} can keep the body steady while the ${moonSign} Moon tests what is ready to grow. ${retrogradeText}.`
  }

  return copyMap[dayKey]
}

function buildHoroscopeHeadline(dayKey, chartData, transits) {
  const natalSun = getPlacementSign(chartData, 'sun')
  const moonSign = transits?.moon?.sign ? toTitleCase(transits.moon.sign) : ''
  const retrogrades = Array.isArray(transits?.retrogrades) ? transits.retrogrades.length : 0

  const pools = {
    yesterday: ['Close the loop', 'Trim the drag', 'Leave less open'],
    today: ['Move with intent', 'Keep it simple', 'Choose the clean path'],
    tomorrow: ['Make room to shift', 'Trust the turn', 'Let the pace change'],
    future: ['Hold the wider view', 'Make space for growth', 'Follow the next signal']
  }

  const seed = `${dayKey}-${natalSun}-${moonSign}-${retrogrades}`
  const pool = pools[dayKey] || pools.today
  const index = Array.from(seed).reduce((value, char) => value + char.charCodeAt(0), 0) % pool.length
  return pool[index]
}

function buildHoroscopeCards(chartData, transitsList, baseDate) {
  const labels = [
    { key: 'yesterday', label: 'Yesterday', offset: -1 },
    { key: 'today', label: 'Today', offset: 0 },
    { key: 'tomorrow', label: 'Tomorrow', offset: 1 },
    { key: 'future', label: 'Next up', offset: 2 }
  ]

  return labels.map(({ key, label, offset }) => {
    const transit = transitsList[offset + 1]
    const dayDate = createLocalDate(baseDate, offset)
    const moonSign = transit?.moon?.sign ? toTitleCase(transit.moon.sign) : 'Moon unknown'
    const retrogrades = Array.isArray(transit?.retrogrades) ? transit.retrogrades : []
    const retrogradeLabel = retrogrades.length
      ? `${retrogrades.map((placement) => toTitleCase(placement.body)).join(', ')} retrograde`
      : ''

    return {
      key,
      dayLabel: label,
      dateLabel: formatShortDay(dayDate),
      headline: buildHoroscopeHeadline(key, chartData, transit),
      copy: buildHoroscopeCopy(key, chartData, transit),
      moonLabel: transit?.moon
        ? `Moon in ${moonSign} · ${transit.moon.phaseName}`
        : 'Moon data unavailable',
      retrogradeLabel,
      chips: buildHoroscopeChips(key, transit, moonSign, retrogrades),
      generatedAt: transit?.generatedAt || baseDate.toISOString()
    }
  })
}

let dailyRefreshToken = 0
function handleDailyContextRefresh() {
  if (chart.value) {
    refreshDailyContext()
  }
}

function handleVisibilityDailyRefresh() {
  if (document.visibilityState === 'visible' && chart.value) {
    refreshDailyContext()
  }
}

async function refreshDailyContext() {
  if (!chart.value) {
    currentTransits.value = null
    dailyHoroscopeCards.value = []
    dailyHoroscopeRefreshedAt.value = ''
    return
  }

  const token = ++dailyRefreshToken
  const now = new Date()

  try {
    const dates = [-1, 0, 1, 2].map((offset) => createLocalDate(now, offset))
    const transits = await Promise.all(dates.map((date) => calculateCurrentTransits(chart.value, date)))
    if (token !== dailyRefreshToken) return

    currentTransits.value = transits[1] || null
    dailyHoroscopeCards.value = buildHoroscopeCards(chart.value, transits, now)
    dailyHoroscopeRefreshedAt.value = transits[1]?.generatedAt || now.toISOString()
  } catch (transitError) {
    console.warn(transitError)
    if (token !== dailyRefreshToken) return
    currentTransits.value = null
    dailyHoroscopeCards.value = []
    dailyHoroscopeRefreshedAt.value = ''
  }
}

watch(
  () => [chart.value, activePartner.value],
  async ([baseChart, partner]) => {
    if (!baseChart || !partner) {
      compositeChart.value = null
      return
    }
    try {
      compositeChart.value = await calculateCompositeChart(baseChart, partner.chart)
    } catch (error) {
      console.warn(error)
      compositeChart.value = null
    }
  },
  { immediate: true }
)

function formatPlacement(placement) {
  if (!placement) return '—'
  return `${toTitleCase(placement.sign)} ${placement.degreeInSign.toFixed(2)}°`
}

function cloneStoredBirthData(formData) {
  if (!formData || typeof formData !== 'object') return null

  return {
    date: formData.date || '',
    time: formData.time || '',
    address: formData.address || '',
    houseSystem: formData.houseSystem || 'placidus',
    lat: formData.lat ?? '',
    lon: formData.lon ?? '',
    timeZoneOverride: formData.timeZoneOverride || '',
    useManualCoordinates: Boolean(formData.useManualCoordinates)
  }
}

function cloneResolvedLocation(location) {
  if (!location || typeof location !== 'object') return null
  return {
    label: location.label || '',
    lat: Number(location.lat),
    lon: Number(location.lon)
  }
}

function buildProfileRecord({ chartData, birthData, location, shareMedia = null }) {
  if (!chartData) return null

  const profile = buildProfileIdentity(chartData)
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    profile,
    birthData: cloneStoredBirthData(birthData),
    resolvedLocation: cloneResolvedLocation(location),
    chart: chartData,
    shareMedia
  }
}

function persistProfileRecord(nextRecord) {
  storedProfileRecord.value = nextRecord
  storedShareMedia.value = nextRecord?.shareMedia || null
  savedBirthData.value = nextRecord?.birthData || null
  if (nextRecord?.resolvedLocation) {
    resolvedLocation.value = nextRecord.resolvedLocation
  }
  if (!nextRecord) {
    clearStoredProfile()
    return
  }
  writeStoredProfile(nextRecord)
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result || '')))
    reader.addEventListener('error', () => reject(new Error('Unable to cache the generated media.')))
    reader.readAsDataURL(file)
  })
}

async function cacheShareMedia(payload) {
  if (!payload?.file) return

  const dataUrl = payload.file.size <= 1_500_000
    ? await readFileAsDataUrl(payload.file).catch(() => '')
    : ''

  const shareMedia = {
    kind: payload.kind,
    fileName: payload.fileName,
    mimeType: payload.mimeType,
    size: payload.size,
    createdAt: payload.createdAt,
    dataUrl
  }

  const nextRecord = buildProfileRecord({
    chartData: chart.value,
    birthData: savedBirthData.value,
    location: resolvedLocation.value,
    shareMedia
  })

  if (nextRecord) {
    persistProfileRecord(nextRecord)
  } else {
    storedShareMedia.value = shareMedia
  }
}

function restoreStoredState() {
  const stored = readStoredProfile()
  if (!stored) return

  storedProfileRecord.value = stored
  storedShareMedia.value = stored.shareMedia || null
  savedBirthData.value = stored.birthData || null
  resolvedLocation.value = stored.resolvedLocation || null
  chart.value = stored.chart || null

  if (stored.chart) {
    refreshDailyContext()
  }
}

function toggleProfileMenu() {
  if (isProfileMenuOpen.value) {
    isProfileResetArmed.value = false
    isProfileMenuOpen.value = false
    return
  }

  isProfileMenuOpen.value = !isProfileMenuOpen.value
}

function formatStoredAt(value) {
  if (!value) return 'Just now'
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value))
  } catch (error) {
    return value
  }
}

function formatBirthDate(value) {
  if (!value) return 'Date not set'
  if (value.includes('-')) {
    const parts = value.split('-')
    if (parts.length === 3) {
      const [year, month, day] = parts
      return `${day}/${month}/${year}`
    }
  }
  return value
}

function formatCoordinates(lat, lon) {
  const parsedLat = Number(lat)
  const parsedLon = Number(lon)
  if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLon)) return 'Pending'
  return `${parsedLat.toFixed(2)}, ${parsedLon.toFixed(2)}`
}

function formatMediaKind(kind) {
  const labels = {
    'story-image': 'Story image',
    'chart-gif': 'Chart GIF',
    reel: 'Reel video'
  }
  return labels[kind] || 'Share media'
}

function openBirthEditor() {
  birthEditorRequest.value += 1
  isProfileMenuOpen.value = false
}

function openStoredShareMedia() {
  if (!storedShareMedia.value?.dataUrl) return
  window.open(storedShareMedia.value.dataUrl, '_blank', 'noopener,noreferrer')
}

function deleteProfileData() {
  clearStoredProfile()
  isProfileResetArmed.value = false
  storedProfileRecord.value = null
  storedShareMedia.value = null
  savedBirthData.value = null
  chart.value = null
  resolvedLocation.value = null
  currentTransits.value = null
  dailyHoroscopeCards.value = []
  dailyHoroscopeRefreshedAt.value = ''
  partnerCharts.value = []
  activePartnerId.value = ''
  partnerResolvedLocation.value = null
  compositeChart.value = null
  error.value = ''
  partnerError.value = ''
  isAdvancedView.value = false
  isProfileMenuOpen.value = false
}

function handleProfileResetClick() {
  if (!isProfileResetArmed.value) {
    isProfileResetArmed.value = true
    return
  }

  deleteProfileData()
}

watch(isProfileMenuOpen, (isOpen) => {
  if (!isOpen) {
    isProfileResetArmed.value = false
  }
})

async function handleSubmit(formData) {
  loading.value = true
  error.value = ''
  currentTransits.value = null
  isAdvancedView.value = false

  try {
    const manualLat = formData.lat === '' ? NaN : Number(formData.lat)
    const manualLon = formData.lon === '' ? NaN : Number(formData.lon)
    const hasManualCoords = Number.isFinite(manualLat) && Number.isFinite(manualLon)
    const location = hasManualCoords
      ? {
        lat: manualLat,
        lon: manualLon,
        label: formData.address || 'Custom coordinates'
      }
      : await geocodeAddress(formData.address)
    resolvedLocation.value = location

    const chartData = await calculateNatalChart({
      date: formData.date,
      time: formData.time,
      address: location.label,
      lat: location.lat,
      lon: location.lon,
      houseSystem: formData.houseSystem,
      timeZoneOverride: formData.timeZoneOverride
    })
    chart.value = chartData

    persistProfileRecord(buildProfileRecord({
      chartData: chartData,
      birthData: formData,
      location
    }))
    await refreshDailyContext()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Something went wrong.'
  } finally {
    loading.value = false
  }
}

function isIOSBrowser() {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function getPdfRenderScale(width, height) {
  if (!width || !height) return 1
  const maxPixels = isIOSBrowser() ? 5_000_000 : 16_000_000
  const maxSide = isIOSBrowser() ? 4096 : 8192
  const areaScale = Math.sqrt(maxPixels / (width * height))
  const sideScale = Math.min(maxSide / width, maxSide / height)
  return Math.max(1, Math.min(2, areaScale, sideScale))
}

function getPdfChunkHeight(width, pageHeight, scale) {
  const maxPixels = isIOSBrowser() ? 5_000_000 : 16_000_000
  const maxSide = isIOSBrowser() ? 4096 : 8192
  const maxByPixels = Math.floor(maxPixels / (width * scale * scale))
  const maxBySide = Math.floor(maxSide / scale)
  const maxHeight = Math.max(pageHeight, Math.min(maxByPixels, maxBySide))
  const pagesPerChunk = Math.max(1, Math.floor(maxHeight / pageHeight))
  return pageHeight * pagesPerChunk
}

function createPdfSlice(target, offsetY, width, height) {
  const host = document.createElement('div')
  Object.assign(host.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${width}px`,
    height: `${height}px`,
    overflow: 'hidden',
    pointerEvents: 'none',
    background: '#f5f7fb',
    zIndex: '-1'
  })

  const clone = target.cloneNode(true)
  Object.assign(clone.style, {
    width: `${width}px`,
    maxWidth: 'none',
    transform: `translateY(-${offsetY}px)`,
    transformOrigin: 'top left'
  })

  host.appendChild(clone)
  document.body.appendChild(host)

  return host
}

async function waitForImages(root) {
  const images = Array.from(root.querySelectorAll('img')).filter((image) => !image.complete)
  if (!images.length) return

  await Promise.all(images.map((image) => new Promise((resolve) => {
    image.addEventListener('load', resolve, { once: true })
    image.addEventListener('error', resolve, { once: true })
  })))
}

async function renderPdfSlice(target, offsetY, width, height, scale) {
  const host = createPdfSlice(target, offsetY, width, height)

  try {
    await waitForImages(host)
    return await html2canvas(host, {
      scale,
      backgroundColor: '#f5f7fb',
      useCORS: true,
      width,
      height,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: Math.max(document.documentElement.clientHeight, height),
      scrollX: 0,
      scrollY: 0
    })
  } finally {
    host.remove()
  }
}

async function downloadPdf() {
  if (!chart.value || !pdfTarget.value || isDownloading.value) return
  isDownloading.value = true

  try {
    await nextTick()

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const target = pdfTarget.value
    const targetWidth = Math.max(1, Math.ceil(target.getBoundingClientRect().width))
    const targetHeight = Math.max(1, Math.ceil(target.scrollHeight))
    const pageCssHeight = Math.max(1, Math.floor(targetWidth * (pageHeight / pageWidth)))
    const renderScale = getPdfRenderScale(targetWidth, pageCssHeight)
    const chunkCssHeight = getPdfChunkHeight(targetWidth, pageCssHeight, renderScale)

    let offsetY = 0
    let pageIndex = 0

    while (offsetY < targetHeight) {
      const sliceHeight = Math.min(chunkCssHeight, targetHeight - offsetY)
      const canvas = await renderPdfSlice(target, offsetY, targetWidth, sliceHeight, renderScale)
      const imgData = canvas.toDataURL('image/png')
      const scaledHeight = (sliceHeight * pageWidth) / targetWidth
      let pageOffset = 0
      let remainingHeight = scaledHeight

      while (remainingHeight > 0) {
        if (pageIndex > 0) {
          pdf.addPage()
        }

        pdf.addImage(imgData, 'PNG', 0, -pageOffset, pageWidth, scaledHeight)
        pageOffset += pageHeight
        remainingHeight -= pageHeight
        pageIndex += 1
      }

      offsetY += sliceHeight
    }

    const filename = chart.value?.meta?.date
      ? `natal-chart-${chart.value.meta.date}.pdf`
      : 'natal-chart.pdf'
    pdf.save(filename)
  } catch (err) {
    console.error(err)
  } finally {
    isDownloading.value = false
  }
}

async function handlePartnerSubmit(formData) {
  partnerLoading.value = true
  partnerError.value = ''

  try {
    const manualLat = formData.lat === '' ? NaN : Number(formData.lat)
    const manualLon = formData.lon === '' ? NaN : Number(formData.lon)
    const hasManualCoords = Number.isFinite(manualLat) && Number.isFinite(manualLon)
    const location = hasManualCoords
      ? {
        lat: manualLat,
        lon: manualLon,
        label: formData.address || 'Custom coordinates'
      }
      : await geocodeAddress(formData.address)
    partnerResolvedLocation.value = location

    const chartData = await calculateNatalChart({
      date: formData.date,
      time: formData.time,
      address: location.label,
      lat: location.lat,
      lon: location.lon,
      houseSystem: formData.houseSystem,
      timeZoneOverride: formData.timeZoneOverride
    })

    const label = formData.label?.trim() || `Partner ${partnerCharts.value.length + 1}`
    const id = (globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`)
    partnerCharts.value = [
      ...partnerCharts.value,
      {
        id,
        label,
        chart: chartData
      }
    ]
    activePartnerId.value = id
    isPartnerModalOpen.value = false
  } catch (err) {
    partnerError.value = err instanceof Error ? err.message : 'Something went wrong.'
  } finally {
    partnerLoading.value = false
  }
}

function handleMediaGenerated(payload) {
  cacheShareMedia(payload).catch((error) => {
    console.warn(error)
  })
}

function getElementFromRef(targetRef) {
  return targetRef?.$el || targetRef || null
}

async function scrollToShareSection() {
  await nextTick()
  const target = getElementFromRef(simplifiedChartRef.value)
  if (!target?.scrollIntoView) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function openAdvancedViewFromDaily() {
  isAdvancedView.value = true
  await nextTick()
  const target = getElementFromRef(pdfTarget.value) || getElementFromRef(advancedEntryRef.value)
  if (!target?.scrollIntoView) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function openPartnerModal() {
  partnerError.value = ''
  partnerResolvedLocation.value = null
  isPartnerModalOpen.value = true
}

function closePartnerModal() {
  isPartnerModalOpen.value = false
}

function removePartnerChart(id) {
  partnerCharts.value = partnerCharts.value.filter((partner) => partner.id !== id)
  if (activePartnerId.value === id) {
    activePartnerId.value = partnerCharts.value[0]?.id || ''
  }
}

async function selectPartnerChart(id) {
  activePartnerId.value = id
  isAdvancedView.value = true

  await nextTick()

  if (!compatibilityAccordionRef.value) return

  compatibilityAccordionRef.value.open = true
  await nextTick()
  compatibilityAccordionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function removeActivePartner() {
  if (!activePartner.value) return
  removePartnerChart(activePartner.value.id)
}

function formatOffset(minutes) {
  if (typeof minutes !== 'number' || Number.isNaN(minutes)) return ''
  const sign = minutes >= 0 ? '+' : '-'
  const abs = Math.abs(minutes)
  const hours = Math.floor(abs / 60)
  const mins = Math.round(abs % 60)
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function formatHouseSystem(value) {
  if (!value) return 'Placidus'
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function setMotionVariables(x, y) {
  const clampedX = Math.max(-1, Math.min(1, x))
  const clampedY = Math.max(-1, Math.min(1, y))
  document.documentElement.style.setProperty('--motion-x', clampedX.toFixed(4))
  document.documentElement.style.setProperty('--motion-y', clampedY.toFixed(4))
}

function applyScrollMotion() {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const progress = window.scrollY / maxScroll
  setMotionVariables((progress - 0.5) * 2, Math.sin(progress * Math.PI * 2) * 0.65)
}

function updateScrollMotion() {
  if (!isMotionSurfaceVisible) return

  if (motionFrame) window.cancelAnimationFrame(motionFrame)
  motionFrame = window.requestAnimationFrame(() => {
    applyScrollMotion()
    motionFrame = 0
  })
}

function startScrollMotionLoop() {
  if (scrollMotionInterval || !isTouchMotion || !isMotionSurfaceVisible) return
  applyScrollMotion()
  scrollMotionInterval = window.setInterval(applyScrollMotion, 100)
}

function stopScrollMotionLoop() {
  if (!scrollMotionInterval) return
  window.clearInterval(scrollMotionInterval)
  scrollMotionInterval = 0
}

function handlePointerMotion(event) {
  if (!isMotionSurfaceVisible || isTouchMotion) return

  if (motionFrame) window.cancelAnimationFrame(motionFrame)
  motionFrame = window.requestAnimationFrame(() => {
    setMotionVariables(
      (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2,
      (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2
    )
    motionFrame = 0
  })
}

function setupLineMotion() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)')
  isTouchMotion = coarsePointer.matches || window.innerWidth <= 720
  isMotionSurfaceVisible = true
  document.documentElement.dataset.motionMode = isTouchMotion ? 'scroll' : 'pointer'

  if (reduceMotion.matches) return

  motionObserver = new IntersectionObserver(
    ([entry]) => {
      isMotionSurfaceVisible = Boolean(entry?.isIntersecting)
      if (isMotionSurfaceVisible && isTouchMotion) startScrollMotionLoop()
      if (!isMotionSurfaceVisible) stopScrollMotionLoop()
    },
    { threshold: 0.08 }
  )

  const surface = document.querySelector('.app-shell')
  if (surface) motionObserver.observe(surface)

  window.addEventListener('pointermove', handlePointerMotion, { passive: true })
  window.addEventListener('mousemove', handlePointerMotion, { passive: true })
  window.addEventListener('scroll', updateScrollMotion, { passive: true })
  document.addEventListener('scroll', updateScrollMotion, { passive: true, capture: true })
  window.addEventListener('resize', handleMotionResize, { passive: true })
  if (isTouchMotion) startScrollMotionLoop()
}

function handleMotionResize() {
  isTouchMotion = window.matchMedia('(hover: none), (pointer: coarse)').matches || window.innerWidth <= 720
  document.documentElement.dataset.motionMode = isTouchMotion ? 'scroll' : 'pointer'
  if (isTouchMotion) {
    updateScrollMotion()
    startScrollMotionLoop()
  } else {
    stopScrollMotionLoop()
  }
}

function teardownLineMotion() {
  if (motionFrame) {
    window.cancelAnimationFrame(motionFrame)
    motionFrame = 0
  }
  stopScrollMotionLoop()
  motionObserver?.disconnect()
  motionObserver = null
  window.removeEventListener('pointermove', handlePointerMotion)
  window.removeEventListener('mousemove', handlePointerMotion)
  window.removeEventListener('scroll', updateScrollMotion)
  document.removeEventListener('scroll', updateScrollMotion, { capture: true })
  window.removeEventListener('resize', handleMotionResize)
}

onMounted(() => {
  restoreStoredState()
  setupLineMotion()
  window.addEventListener('focus', handleDailyContextRefresh)
  window.addEventListener('pageshow', handleDailyContextRefresh)
  document.addEventListener('visibilitychange', handleVisibilityDailyRefresh)
})

onBeforeUnmount(() => {
  teardownLineMotion()
  window.removeEventListener('focus', handleDailyContextRefresh)
  window.removeEventListener('pageshow', handleDailyContextRefresh)
  document.removeEventListener('visibilitychange', handleVisibilityDailyRefresh)
})
</script>
